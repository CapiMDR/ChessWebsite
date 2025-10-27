//Handles communication with the clients
//Node.js imports
import express from "express";
import https from "https";
import path from "path";
import { Server } from "socket.io";
import fs from "fs";
import os from "os";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { getGameStatus, gameIsOver, startGame, isLegalMove } from "./ServerGame.js";
import { white, black } from "../Shared/Constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

//Certificates for https (only stored inside project for development purposes)
const options = {
  key: fs.readFileSync('Certs/server.key'),
  cert: fs.readFileSync('Certs/server.crt')
};

//Get local ip automatically
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();

//Https server
const server = https.createServer(options, app);

const io = new Server(server, {
  cors: {
    origin: [
      `https://${localIP}`,
      `https://localhost`,
      `http://${localIP}`,
      `http://localhost`
    ],
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: [
    `https://${localIP}`,
    `https://localhost`,
    `http://${localIP}`,
    `http://localhost`
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));

//Serving files to the clients
app.use(express.static(__dirname));
app.use('/assets', express.static(path.join(__dirname, '../../Assets')));
app.use('/shared', express.static(path.join(__dirname, '../Shared')));
app.use(express.static(path.join(__dirname, '../Chess')));

let onlineUsers = 0;
let gameHasStarted = false;

// Map playerId -> { color, socketId }
const players = {};
let colorAssignments = { [white]: null, [black]: null };
let originalPlayers = { [white]: null, [black]: null };

//Socket actions
io.on('connection', (socket) => {
  const playerId = socket.handshake.query.playerId;
  if (!playerId) {
    console.warn(`Connection without playerId rejected`);
    socket.disconnect();
    return;
  }
  console.log(`Player connected: ${playerId} (socket: ${socket.id}). Online: ${onlineUsers}`);

  socket.on('disconnect', () => {
    onlineUsers--;
    console.log(`Player ${playerId} disconnected (socket: ${socket.id})`);

    //Clearing color assignment if game hasn't started yet when a player disconnects
    if (gameHasStarted) return;
    if (colorAssignments[white] === playerId) colorAssignments[white] = null;
    if (colorAssignments[black] === playerId) colorAssignments[black] = null;
  });

  socket.on('message', (msg) => {
    switch (msg.type) {
      case 'ready':
        onlineUsers++;
        console.log(`New user ready (${socket.id}). Online: ${onlineUsers}`);

        //Assign color to the player. If both colors taken, assign spectator. If reconnecting, assign original color.
        const assignedColor = assignColor(playerId);
        players[playerId] = { color: assignedColor, socketId: socket.id };

        socket.emit("message", { type: "color", color: assignedColor });

        if (gameHasStarted) {
            const gameStatus = getGameStatus();
            socket.emit('message', { type: 'startGame' });
            socket.emit('message', { type: 'syncGame', gameStatus });
          return;
        }

        //Start game when both players ready (both colors assigned)
        const bothReady = colorAssignments[white] && colorAssignments[black];
        if (!bothReady) return;
        startGame();
        gameHasStarted = true;

        //Keep track of the two players who started the game
        originalPlayers[white] = colorAssignments[white];
        originalPlayers[black] = colorAssignments[black];

        io.emit("message", { type: "startGame" });
        break;

      case 'move':
        const move = msg.move;
        //If the server receives a move from a client, validate it and resend it to everyone
        if (!isLegalMove(move)) return;

        const gameStatus = getGameStatus();
        io.emit('message', { type: 'move', move, gameStatus });

        //If the game is over after the move, notify clients
        if (gameIsOver()) io.emit('message', { type: 'endGame' });
        break;

      default:
        console.log("Invalid message type");
    }
  });
});

//Server start
server.listen(3000, '0.0.0.0', () => {
  console.log(`Server running at:`);
  console.log(`  https://${localIP}:3000`);
  console.log(`URL:  https://${localIP}/ChessWebsite/Landing`);
});

function assignColor(playerId) {
  if (gameHasStarted) {
    //Only original players can rejoin
    for (const color of [white, black]) {
      if (originalPlayers[color] === playerId) {
        colorAssignments[color] = playerId;
        console.log(`Original ${color} player reconnected`);
        return color;
      }
    }
    return "spectator";
  }

  //Before game starts assign available color
  const availableColors = [];
  if (!colorAssignments[white]) availableColors.push(white);
  if (!colorAssignments[black]) availableColors.push(black);

  if (availableColors.length > 0) {
    const assigned = availableColors[Math.floor(Math.random() * availableColors.length)];
    colorAssignments[assigned] = playerId;
    return assigned;
  }

  return "spectator";
}