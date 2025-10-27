//Runs a game locally using the moves/results received from the server
import { Timer } from '../Shared/Timer.js';
import { Engine } from '../Shared/Engine.js';

const startFEN="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

let whiteTimer;
const whiteMinutes=5;
const whiteIncrementSeconds=3;

let blackTimer;
const blackMinutes=5;
const blackIncrementSeconds=3;

export let engine;

export function setupGame() {
    //Minutes & increment in seconds
    whiteTimer=new Timer(whiteMinutes,whiteIncrementSeconds);
    blackTimer=new Timer(blackMinutes,blackIncrementSeconds);
    engine = new Engine(startFEN); //Starting position, white timer, black timer
    engine.setTimers(whiteTimer, blackTimer);
}

export function syncTimers(gameStatus){
  whiteTimer.remainingTime = gameStatus.whiteTime;
  blackTimer.remainingTime = gameStatus.blackTime;
}

//Plays a move received from the server on the client side
export function playBackMove(move){
  engine.playMove(move, false);
}