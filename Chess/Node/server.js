//Handles communication with the clients
//Node.js imports
import express from "express";
import https from "https";
import path from "path";
import { Server } from "socket.io";
import fs from "fs";
import os from "os";
import cors from "cors";
import { fileURLToPath  } from 'url';
import { dirname  } from 'path';

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
        //New client connected and ready to begin
        onlineUsers++;
        console.log('New user connected ' + onlineUsers);
        //Once 2 users join the game, start it
        if(onlineUsers==2){
          console.log("Staring game")
          io.emit('message', {type: 'startGame'});
        } 
      break;

      case 'move':
        console.log('Receive move ' + msg.move);
        //TODO: Validate client move before broadcasting
        io.emit('message', {type: 'move', move: msg.move});
      break;

      default: console.log("Invalid message type from a client");    
    }
  });
});

//Server start
server.listen(3000, '0.0.0.0', () => {
  console.log(`Server running at:`);
  console.log(`  https://${localIP}:3000`);
});
