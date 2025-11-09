//Handles communication with the server.js
import {
  receiveColorFromServer,
  handleGameStart,
  handleGameEnd,
  playMoveLocally,
  playAllServerMoves,
  syncGameWithServer,
} from "./ClientController.js";

export const host = window.location.hostname; //Current host ip
export const port = 3000; //Node server port
let socket;
let joinedMatchID;

export function startConnection() {
  //Generate or retrieve unique player ID
  let playerId = localStorage.getItem("playerId");
  if (!playerId) {
    playerId = crypto.randomUUID();
    localStorage.setItem("playerId", playerId);
  }

  //Connecting to server with unique player ID
  socket = io(`https://${host}:${port}`, { query: { playerId } });

  //Message handler for messages received from server
  socket.on("message", (msg) => {
    switch (msg.type) {
      case "color":
        receiveColorFromServer(msg.color);
        break;
      case "startGame":
        handleGameStart();
        break;
      case "endGame":
        handleGameEnd(msg.gameStatus.gameResult);
        break;
      case "move":
        playMoveLocally(msg.move);
        syncGameWithServer(msg.gameStatus);
        break;
      case "syncGame":
        playAllServerMoves(msg.gameStatus);
        syncGameWithServer(msg.gameStatus);
        break;
      case "joinMatch":
        joinedMatchID = msg.matchID;
        break;
      default:
        console.log("Invalid message type from server");
    }
  });
}

export function sendToServer(msgContent) {
  msgContent.matchID = joinedMatchID;
  socket.emit("message", msgContent);
}
