//Runs a game locally using the moves/results received from the server
import { Timer } from '../Shared/Timer.js';
import { Engine } from '../Shared/Engine.js';
import { playMoveSound, playSound, updateMoveList } from './Renderer.js';
import { sendToServer, startConnection } from './ClientNetwork.js';

export const gameMode = window.gameMode;

const startFEN="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

let whiteTimer;
const whiteMinutes=5;
const whiteIncrementSeconds=3;
let blackTimer;
const blackMinutes=5;
const blackIncrementSeconds=3;

export let engine = new Engine(startFEN); //Starting position, white timer, black timer;
export let clientColor; //Color assigned to this client by the server

//Minutes & increment in seconds
whiteTimer=new Timer(whiteMinutes,whiteIncrementSeconds);
blackTimer=new Timer(blackMinutes,blackIncrementSeconds);
engine.setTimers(whiteTimer, blackTimer);

export function onPageLoaded(){
    if(gameMode=='online'){
        //If online mode, tell server this client is ready
        startConnection();
        sendToServer({type: 'ready'});
    }else{
        //If local or bot mode, start game immediately
        handleGameStart();
    }
}

export function playAllServerMoves(gameStatus){
    //Playing all moves played so far on local board if a client disconnects and reconnects
    for(let move of gameStatus.movesList){
        playMoveLocally(move, false);
    }
}

//Rerceives assigned color from server
export function receiveColorFromServer(color){
    clientColor = color;
}

export function handleGameStart(){
    document.getElementById('overlay').style.display = 'none'; //Disabling shadow over canvas
    engine.startGame();
    playSound("Start");
}

export function syncGameWithServer(gameStatus){
  engine.clrToMove = gameStatus.clrToMove;
  engine.result = gameStatus.gameResult;
  whiteTimer.remainingTime = gameStatus.whiteTime;
  blackTimer.remainingTime = gameStatus.blackTime;
}

export function handleGameEnd(){
    playSound("End");
}

//Registers a move played locally. If multiplayer, sends it to the server, otherwise just plays it locally
export function registerMove(playedMove){
    if(gameMode=='online'){
        //Only send move to server if it's this client's turn
        if(clientColor==engine.clrToMove) sendToServer({type: 'move', move: playedMove});
    }else{
        playMoveLocally(playedMove);
    }
}

//Any move received is played on the local board
export function playMoveLocally(move, shouldPlaySounds=true){
    if(shouldPlaySounds) playMoveSound(move);
    engine.playMove(move, false);
    if(engine.inCheck && shouldPlaySounds) playSound("Check");
    updateMoveList(move);
}