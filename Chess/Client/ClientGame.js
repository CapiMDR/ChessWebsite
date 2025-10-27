//Runs a game locally using the moves/results received from the server
import { Timer } from '../Shared/Timer.js';
import { Engine } from '../Shared/Engine.js';
<<<<<<< HEAD
import { playMoveSound, playSound, updateMoveList } from './Renderer.js';
=======
>>>>>>> 69a3e34a01266ce90eed725bda0407356a481d4b

const startFEN="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

let whiteTimer;
const whiteMinutes=5;
const whiteIncrementSeconds=3;

let blackTimer;
const blackMinutes=5;
const blackIncrementSeconds=3;

export let engine;
<<<<<<< HEAD
export let clientColor;
=======
>>>>>>> 69a3e34a01266ce90eed725bda0407356a481d4b

export function setupGame() {
    //Minutes & increment in seconds
    whiteTimer=new Timer(whiteMinutes,whiteIncrementSeconds);
    blackTimer=new Timer(blackMinutes,blackIncrementSeconds);
    engine = new Engine(startFEN); //Starting position, white timer, black timer
    engine.setTimers(whiteTimer, blackTimer);
}

<<<<<<< HEAD
export function handleServerSync(gameStatus, shouldPlayAllMoves){
    if(shouldPlayAllMoves){
        //Playing all moves played so far on local board if a client disconnects and reconnects
        for(let move of gameStatus.movesList){
            handleMove(move, false);
        }
    }
    syncGame(gameStatus);
}

export function receiveColorFromServer(color){
    clientColor = color;
}

export function handleGameStart(){
    document.getElementById('overlay').style.display = 'none'; //Disabling shadow over canvas
    engine.startGame();
    playSound("Start");
}

export function syncGame(gameStatus){
  engine.clrToMove = gameStatus.clrToMove;
  engine.result = gameStatus.gameResult;
=======
export function syncTimers(gameStatus){
>>>>>>> 69a3e34a01266ce90eed725bda0407356a481d4b
  whiteTimer.remainingTime = gameStatus.whiteTime;
  blackTimer.remainingTime = gameStatus.blackTime;
}

//Plays a move received from the server on the client side
export function playBackMove(move){
  engine.playMove(move, false);
<<<<<<< HEAD
}

export function handleGameEnd(){
    playSound("End");
}

export function handleMove(move, shouldPlaySounds=true){
    if(shouldPlaySounds) playMoveSound(move);
    playBackMove(move);
    if(engine.inCheck && shouldPlaySounds) playSound("Check");
    updateMoveList(move);
=======
>>>>>>> 69a3e34a01266ce90eed725bda0407356a481d4b
}