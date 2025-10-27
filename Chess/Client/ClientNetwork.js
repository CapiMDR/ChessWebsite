//Handles communication with the server.js
import { handleGameStart, handleGameEnd, handleServerSync, handleMove } from './ClientMain.js';

export const host = window.location.hostname; //Current host ip
export const port = 3000; //Node server port
const socket = io(`https://${host}:${port}`); //Url

export function sendToServer(msgContent){
    socket.emit('message', msgContent);
}

socket.on('message',(msg) => {
    switch(msg.type){
      //If the client receives a move from the server, play it on the local board
        case 'startGame': handleGameStart();
        break;
        case 'endGame': handleGameEnd();
        break;   
        case 'move': handleMove(msg.move);
        break;
        case 'syncGame': handleServerSync(msg.gameStatus);
        break;
        default: console.log("Invalid message type from server"); 
    }   
});