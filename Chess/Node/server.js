//Node.js imports
import express from "express";
import https from "https";
import path from "path";
import {Server} from "socket.io";
import fs from "fs";
import os from "os";
import cors from "cors";
import { fileURLToPath  } from 'url';
import { dirname  } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

//Chess app imports
import { Board } from '../Shared/Board.js';
import { MoveGenerator } from '../Shared/MoveGenerator.js';
const myBoard = new Board();
myBoard.fillBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
const myMoveGen = new MoveGenerator();
const myMoves = myMoveGen.generateMoves(myBoard);

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
app.use('/assets', express.static(path.join(__dirname, '../Assets')));
app.use('/shared', express.static(path.join(__dirname, '../Shared')));
app.use(express.static(path.join(__dirname, '../Chess')));

//Socket actions
io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('sendMove', (move) => {
    console.log(`Received move: ${move}`);
    socket.broadcast.emit('sendMove', move);
  });

  socket.on('startGame', () => {
    console.log('Starting game');
    socket.broadcast.emit('startGame');
  });

  socket.on('setPosition', (FEN) => {
    console.log(`Setting position to: ${FEN}`);
    socket.broadcast.emit('setPosition', FEN);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

//Server start
server.listen(3000, '0.0.0.0', () => {
  console.log(`Server running at:`);
  console.log(`  https://localhost:3000`);
  console.log(`  https://${localIP}:3000`);
  console.log(myMoves);
});
