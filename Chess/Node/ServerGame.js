//Runs a game between 2 clients, validates legality of moves made and coordinates position/timers/game start/game end
import { Engine, GameResult } from '../Shared/Engine.js';
import { Timer } from '../Shared/Timer.js';
import { Move } from '../Shared/Move.js';

const startFEN="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
let engine;
let whiteTimer;
const whiteTime = 5; //Initial time in minutes
const whiteIncrement = 3; //In seconds

let blackTimer;
const blackTime = 5;
const blackIncrement = 3;

export function startGame(){
    engine = new Engine(startFEN);
    whiteTimer = new Timer(whiteTime, whiteIncrement);
    blackTimer = new Timer(blackTime, blackIncrement);
    engine.setTimers(whiteTimer, blackTimer);
    engine.startGame();
}

export function isLegalMove(clientMove){
    for(let move of engine.moves){
        //Move from client matches legal move from the server
        if(move==clientMove){
            //Make move on internal server board copy
            console.log('Received move ' + Move.toString(clientMove));
            engine.playMove(clientMove, false);
            //Tell server to notify all clients that a legal move was made
            return true;
        }
    }
    console.log('Received illegal move ' + Move.toString(clientMove));
    return false;
}

//Returns game status on server to sync players on disconnect/reconnect
export function getGameStatus(){
    return {
        clrToMove: engine.clrToMove,
        movesList: engine.moveHistory, 
        whiteTime: whiteTimer.remainingTime, 
        blackTime: blackTimer.remainingTime,
        gameResult: engine.result
    };
}

export function gameIsOver(){
    return engine.result != GameResult.inProgress;
}