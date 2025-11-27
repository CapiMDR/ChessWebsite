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
  let player = null;
  let isPlayerLoaded = false;

  const earlyMessageQueue = []; //Store messages received early

  console.log(`Socket connected: ${socket.id}, playerId: ${playerID}`);

  //Register listeners
  socket.on("message", (msg) => {
    if (!isPlayerLoaded) {
      //Player data wasn't loaded in time from the database, queue their "ready" message until player info is collected
      console.log("Queued early message:", msg);
      earlyMessageQueue.push(msg);
      return;
    }
    processMessage(msg);
  });

  socket.on("disconnect", () => {
    if (player) {
      onlineUsers--;
      console.log(`Player ${player.username} disconnected (socket: ${socket.id}). Online: ${onlineUsers}`);
      matchManager.onPlayerDisconnect(player);
    } else {
      console.log(`Socket ${socket.id} disconnected before player loaded.`);
    }
  });

  //Messages received from clients
  function processMessage(msg) {
    switch (msg.type) {
      case "ready":
        console.log("Player signalled ready");
        matchManager.onPlayerReady(socket, player, msg.matchID);
        break;

      case "move":
        matchManager.onMoveReceived(msg.move, msg.matchID);
        break;

      case "resignation":
        matchManager.onResignation(player, msg.matchID);
        break;

      case "chatMessage":
        sendToAllButSender(socket, { type: "chatMessage", chatMsg: msg.chatMsg, matchID: msg.matchID });
        break;

      default:
        console.log(`Invalid message type from client: ${msg.type}`);
        respondToClient(socket, { type: "error", message: "Invalid message type" });
    }
  }

  if (!playerID) {
    console.log(`Connection without playerId rejected`);
    socket.disconnect();
    return;
  }

  //Fetching player details from database
  try {
    player = await getPlayerById(playerID);

    if (!player) {
      console.log(`No player found with ID: ${playerID}`);
      socket.disconnect();
      return;
    }

    isPlayerLoaded = true;
    onlineUsers++;

    console.log(`Player ${player.username} connected (socket: ${socket.id}). Online: ${onlineUsers}`);

    //If this client messaged "ready" before database connection, unqueue their message and process it
    if (earlyMessageQueue.length > 0) {
      console.log(`Processing ${earlyMessageQueue.length} queued message(s)...`);
      for (const queuedMsg of earlyMessageQueue) {
        processMessage(queuedMsg);
      }
    }
  } catch (err) {
    console.error("Database error fetching player:", err);
    socket.disconnect();
    return;
  }
});

export function sendToAllButSender(socket, msgContent) {
  const matchID = msgContent.matchID;
  if (!matchID) {
    console.warn("[!] sendToAllButSender called without matchID, message type: " + msgContent.type);
    return;
  }
  socket.broadcast.to(matchID).emit("message", msgContent);
}

//Send a message to all clients in a specific match (room)
export function sendToAllClients(msgContent) {
  const matchID = msgContent.matchID;
  if (!matchID) {
    console.warn("[!] sendToAllClients called without matchID, message type: " + msgContent.type);
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
