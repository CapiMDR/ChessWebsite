//Handles communication with the server.js

import { startGame, chess, playMoveSound } from './sketch.js';

export const host = window.location.hostname; //Current host ip
export const port = 3000;                       //Node server port
const socket = io(`https://${host}:${port}`); //Url

export function sendToServer(msgContent){
    socket.emit('message', msgContent);
}

socket.on('message',(msg) => {
    switch(msg.type){
      //If the client receives a move from the server, play it on the local board
        case 'move': playBackMove(msg.move);
        break;
        case 'startGame': startGame();
        break;
        default: console.log("Invalid message type from server");    
    }   
});

//Plays a move received from the server on the client side
function playBackMove(move){
  playMoveSound(move);
  chess.playMove(move, false);
}