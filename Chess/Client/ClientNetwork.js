//Handles communication with the server.js
<<<<<<< HEAD
import { receiveColorFromServer, handleGameStart, handleGameEnd, handleServerSync, handleMove } from './ClientGame.js';
=======
import { handleGameStart, handleGameEnd, handleServerSync, handleMove } from './ClientMain.js';
>>>>>>> 69a3e34a01266ce90eed725bda0407356a481d4b

export const host = window.location.hostname; //Current host ip
export const port = 3000; //Node server port
const socket = io(`https://${host}:${port}`); //Url

export function sendToServer(msgContent){
    socket.emit('message', msgContent);
}

socket.on('message',(msg) => {
    switch(msg.type){
      //If the client receives a move from the server, play it on the local board
<<<<<<< HEAD
        case 'color': receiveColorFromServer(msg.color);
        break;
=======
>>>>>>> 69a3e34a01266ce90eed725bda0407356a481d4b
        case 'startGame': handleGameStart();
        break;
        case 'endGame': handleGameEnd();
        break;   
<<<<<<< HEAD
        case 'move': 
            handleMove(msg.move);
            handleServerSync(msg.gameStatus, false);
        break;
        case 'syncGame': handleServerSync(msg.gameStatus, true);
=======
        case 'move': handleMove(msg.move);
        break;
        case 'syncGame': handleServerSync(msg.gameStatus);
>>>>>>> 69a3e34a01266ce90eed725bda0407356a481d4b
        break;
        default: console.log("Invalid message type from server"); 
    }   
});