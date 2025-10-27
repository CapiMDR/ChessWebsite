//Coordinates game logic, board rendering and sound playing
import { engine, syncTimers, playBackMove } from './ClientGame.js';
import { playSound, playMoveSound, updateMoveList } from './Renderer.js';

export function handleGameStart(){
    document.getElementById('overlay').style.display = 'none'; //Disabling shadow over canvas
    engine.startGame();
    playSound("Start");
}

export function handleGameEnd(){
    playSound("End");
}

export function handleServerSync(gameStatus){
    //Playing all moves played so far on local board
    for(let move of gameStatus.movesList){
        playBackMove(move, false);
        updateMoveList(move);
    }
    syncTimers(gameStatus);
}

export function handleMove(move){
    playMoveSound(move);
    playBackMove(move);
    if(engine.inCheck) playSound("Check");
    updateMoveList(move);
}