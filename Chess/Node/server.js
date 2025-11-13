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
import { getPlayerById } from "./player_query.js";

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

//Socket actions
io.on("connection", async (socket) => {
  const playerID = socket.handshake.query.playerId;
  if (!playerID) {
    console.log(`Connection without playerId rejected`);
    socket.disconnect();
    return;
  }

  let player;
  try {
    player = await getPlayerById(playerID);
    if (!player) {
      console.log(`No player found with ID: ${playerID}`);
      socket.disconnect();
      return;
    }
  } catch (err) {
    console.error("Database error fetching player:", err);
    socket.disconnect();
    return;
  }

  onlineUsers++;
  console.log(`Player ${player.username} connected (socket: ${socket.id}). Online: ${onlineUsers}`);

  socket.on("disconnect", () => {
    onlineUsers--;
    console.log(`Player ${player.username} disconnected (socket: ${socket.id}). Online: ${onlineUsers}`);
    matchManager.onPlayerDisconnect(player);
  });

  socket.on("message", (msg) => {
    switch (msg.type) {
      //Player signals readiness, join or create a new match
      case "ready": {
        matchManager.onPlayerReady(socket, player, msg.matchID);
        break;
      }
      //Player makes a move, validate legality and broadcast to all other clients on that room
      case "move": {
        matchManager.onMoveReceived(msg.move, msg.matchID);
        break;
      }
      case "resignation": {
        matchManager.onResignation(player, msg.matchID);
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
