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

//Certificates for https (only stored inside project for development purposes). These are self-generated
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

let onlineUsers = 0; //Number of clients connected to this server
let gameHasStarted = false; //When a user connects, if game has started sync its board to server board

const players = {}; //socket.id -> { color, name?, reconnected? }
let colorAssignments = { [white]: null, [black]: null }; //track which socket has which color

//Socket actions
io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    onlineUsers--;
    console.log(`User disconnected (${socket.id}). Online: ${onlineUsers}`);

    //Mark the player's slot as free if they were a player
    for (const c of [white, black]) {
      if (colorAssignments[c] === socket.id) {
        colorAssignments[c] = null;
      }
    }
  });

  socket.on('message', (msg) => {
    switch(msg.type){
      case 'ready':
        onlineUsers++;
        console.log(`New user ready (${socket.id}). Online: ${onlineUsers}`);

        //If the player is new, try assigning them a new color
        const assignedColor = assignColor(socket);
        players[socket.id] = { color: assignedColor };
        socket.emit("message", { type: "color", color: assignedColor });

        if(gameHasStarted){
          //If the game has already started, tell the client to sync its board with the server's and start its game
          const gameStatus = getGameStatus();
          socket.emit('message', {type: 'startGame'});
          socket.emit('message', {type: 'syncGame', gameStatus: gameStatus})
          return;
        }
        
        //Once 2 users join the game, start it
        const bothReady = colorAssignments[white] && colorAssignments[black];
        if (bothReady && !gameHasStarted) {
          console.log("Starting game");
          startGame();
          gameHasStarted = true;
          io.emit("message", { type: "startGame" });
        }
      break;

      case 'move':
        const clientMove = msg.move;
        //If the server receives a move from a client, validate it and resend it to everyone
        if(!isLegalMove(clientMove)) return;

        const gameStatus = getGameStatus();
        io.emit('message', {type: 'move', move: clientMove, gameStatus: gameStatus});
        //If the game is over after the move, notify clients
        if(gameIsOver()) io.emit('message', {type: 'endGame'});
      break;

      default: console.log("Invalid message type from a client");    
    }
  });
});

//Server start
server.listen(3000, '0.0.0.0', () => {
  console.log(`Server running at:`);
  console.log(`  https://${localIP}:3000`);
  console.log(`URL:  https://${localIP}/ChessWebsite/Landing`);
});

function assignColor(socket){
  //Assign random color if not already taken
  let assignedColor = null;

  const availableColors = [];
  if (!colorAssignments[white]) availableColors.push(white);
  if (!colorAssignments[black]) availableColors.push(black);

  if (availableColors.length > 0) {
    assignedColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    colorAssignments[assignedColor] = socket.id;
  } else {
    //Both colors taken, make them a spectator
    assignedColor = "spectator";
  }
  return assignedColor;
}