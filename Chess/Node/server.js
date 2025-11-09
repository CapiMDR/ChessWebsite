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
import { matchManager } from "./MatchManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

//Certificates for https (only stored inside project for development purposes)
const options = {
  key: fs.readFileSync("Certs/server.key"),
  cert: fs.readFileSync("Certs/server.crt"),
};

//Get local ip automatically
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const localIP = getLocalIP();

//Https server
const server = https.createServer(options, app);

const io = new Server(server, {
  cors: {
    origin: [`https://${localIP}`, `https://localhost`, `http://${localIP}`, `http://localhost`],
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: [`https://${localIP}`, `https://localhost`, `http://${localIP}`, `http://localhost`],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

//Serving files to the clients
app.use(express.static(__dirname));
app.use("/assets", express.static(path.join(__dirname, "../../Assets")));
app.use("/shared", express.static(path.join(__dirname, "../Shared")));
app.use(express.static(path.join(__dirname, "../Chess")));

let onlineUsers = 0;
//Track which game each player is currently in

//Socket actions
io.on("connection", (socket) => {
  const playerID = socket.handshake.query.playerId;
  if (!playerID) {
    console.warn(`Connection without playerId rejected`);
    socket.disconnect();
    return;
  }
  onlineUsers++;
  console.log(`Player ${playerID} connected (socket: ${socket.id}). Online: ${onlineUsers}`);

  socket.on("disconnect", () => {
    onlineUsers--;
    console.log(`Player ${playerID} disconnected (socket: ${socket.id}). Online: ${onlineUsers}`);

    const match = matchManager.findMatchByPlayer(playerID);
    if (match) match.handleDisconnect(playerID);
    //If the game hasn't started "forget" that this client ever joined this match, otherwise remember for rejoining
    if (!match.gameHasStarted()) matchManager.removePlayerFromMatch(playerID);
  });

  socket.on("message", (msg) => {
    switch (msg.type) {
      //Player signals readiness, join or create a new match
      case "ready": {
        let match;

        //Check if this player was already in a match (reconnect case)
        const previousMatch = matchManager.findMatchByPlayer(playerID);
        if (previousMatch) {
          console.log(`Player ${playerID} reconnected to match ${previousMatch.ID}`);
          socket.join(previousMatch.ID);
          previousMatch.handlePlayerReady(socket, playerID);
          respondToClient(socket, { type: "joinMatch", matchID: previousMatch.ID });
          break; //Stop here, player successfully rejoined
        }

        //Player is not reconnecting (no known match or old match gone)
        if (!msg.matchID) {
          //Try to find a match that hasn't started and isn't full
          match = matchManager.findOpenMatch();

          //No open match found, create a new one
          if (!match) {
            console.log("No empty matches found, creating a new one");
            match = matchManager.createMatch();
          }
        } else {
          //Player provided a specific match ID, try to join it
          match = matchManager.getMatch(msg.matchID);
          if (!match) {
            console.log(`Player ${playerID} tried to join non-existent match ${msg.matchID}`);
            respondToClient(socket, { type: "error", message: "Invalid match ID" });
            return;
          }
        }

        console.log(`Player ${playerID} joining match ${match.ID}`);
        //Assign player to the match room
        socket.join(match.ID);
        //Tell client which match they joined
        respondToClient(socket, { type: "joinMatch", matchID: match.ID });
        //Let the match handle readiness / color assignment / start
        match.handlePlayerReady(socket, playerID);
        //Record mapping of the player to their match
        matchManager.assignPlayerToMatch(playerID, match.ID);
        break;
      }

      //Player makes a move, validate legality and broadcast to all other clients on that room
      case "move": {
        if (!msg.matchID || !msg.move) {
          console.log("Move message missing matchID or move");
          return;
        }

        const match = matchManager.getMatch(msg.matchID);
        if (!match) {
          console.log(`Move for non-existent match ${msg.matchID}`);
          return;
        }

        match.handleReceivedMove(msg.move);
        break;
      }

      default:
        console.log(`Invalid message type from client: ${msg.type}`);
        respondToClient(socket, { type: "error", message: "Invalid message type" });
    }
  });
});

//Send a message to all clients in a specific match (room)
export function sendToAllClients(msgContent) {
  const matchID = msgContent.matchID;
  if (!matchID) {
    console.warn("sendToAllClients called without matchID");
    return;
  }
  io.to(matchID).emit("message", msgContent);
}

//Send a message to a specific socket
export function respondToClient(socket, msgContent) {
  socket.emit("message", msgContent);
}

//Server start
server.listen(3000, "0.0.0.0", () => {
  console.log(`Server running at:`);
  console.log(`  https://${localIP}:3000`);
  console.log(`URL:  https://${localIP}/ChessWebsite/Landing`);
});
