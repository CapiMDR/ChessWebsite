//Handles communication with the server.js
import { receiveColorFromServer, handleGameStart, handleGameEnd, handleServerSync, handleMove } from './ClientGame.js';

export const host = window.location.hostname; //Current host ip
export const port = 3000; //Node server port

//Generate or retrieve unique player ID
let playerId = localStorage.getItem("playerId");
if (!playerId) {
  playerId = crypto.randomUUID();
  localStorage.setItem("playerId", playerId);
}


const socket = io(`https://${host}:${port}`, {
  query: { playerId }
}); //Url

export function sendToServer(msgContent){
    socket.emit('message', msgContent);
}

socket.on('message',(msg) => {
    switch(msg.type){
      //If the client receives a move from the server, play it on the local board
        case 'color': receiveColorFromServer(msg.color);
        break;
        case 'startGame': handleGameStart();
        break;
        case 'endGame': handleGameEnd();
        break;   
        case 'move': 
            handleMove(msg.move);
            handleServerSync(msg.gameStatus, false);
        break;
        case 'syncGame': handleServerSync(msg.gameStatus, true);
        break;
        default: console.log("Invalid message type from server"); 
    }   
});