//Runs a game locally using the moves/results received from the server
import { Timer } from "../Shared/Timer.js";
import { Engine, GameResult } from "../Shared/Engine.js";
import { playMoveSound, playSound, updateMoveList, lastEvaluation } from "./Renderer.js";
import { sendToServer, startConnection } from "./ClientNetwork.js";
import { initializeBot, startBotSearch } from "./BotController.js";
import { white } from "../Shared/Constants.js";

export const gameMode = window.gameMode;

const startFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

let whiteTimer;
const whiteMinutes = 5;
const whiteIncrementSeconds = 3;
let blackTimer;
const blackMinutes = 5;
const blackIncrementSeconds = 3;

export let engine = new Engine(startFEN); //Starting position, white timer, black timer;
export let clientColor; //Color assigned to this client by the server
clientColor = white; //TEMPORARY DEFAULT ASSIGNMENT TO WHITE FOR PLAYING AGAINST THE BOT UNTIL USER SELECTION IS ALLOWED BEFORE GAME START

//Minutes & increment in seconds
whiteTimer = new Timer(whiteMinutes, whiteIncrementSeconds);
blackTimer = new Timer(blackMinutes, blackIncrementSeconds);
engine.setTimers(whiteTimer, blackTimer);

export function onPageLoaded() {
  switch (gameMode) {
    case "online":
      //If online mode, tell server this client is ready
      startConnection();
      sendToServer({ type: "ready" });
      break;
    case "bot":
      initializeBot();
      break;
  }
}

export function playAllServerMoves(gameStatus) {
  //Playing all moves played so far on local board if a client disconnects and reconnects
  for (let move of gameStatus.movesList) {
    playMoveLocally(move, false);
  }
}

//Rerceives assigned color from server
export function receiveColorFromServer(color) {
  clientColor = color;
}

export function handleGameStart() {
  document.getElementById("overlay").style.display = "none"; //Disabling shadow over canvas
  engine.startGame();
  playSound("Start");
}

export function syncGameWithServer(gameStatus) {
  engine.clrToMove = gameStatus.clrToMove;
  engine.result = gameStatus.gameResult;
  whiteTimer.remainingTime = gameStatus.whiteTime;
  blackTimer.remainingTime = gameStatus.blackTime;
}

export function handleGameEnd() {
  playSound("End");
}

//Registers a move played locally. If multiplayer, sends it to the server for validation, otherwise just plays it immediately
export function registerMove(playedMove) {
  //Don't register any move locally if undoing moves
  if (engine.isUndoingMoves()) return;

  switch (gameMode) {
    case "online":
      //Only send move to server if it's this client's turn
      if (clientColor == engine.clrToMove) sendToServer({ type: "move", move: playedMove });
      break;
    case "bot":
      //Let the bot play if bot mode and player just moved
      if (engine.clrToMove == clientColor) {
        playMoveLocally(playedMove);
        startBotSearch(engine.board);
      }
      break;
    case "local":
      //If localmode play the move immediately
      playMoveLocally(playedMove);
      break;
  }
}

//Any move received is played on the local board
export function playMoveLocally(move, shouldPlaySounds = true) {
  //TODO: Allow for move undoing/redoing during the game and resynching the board when a new move arrives
  if (shouldPlaySounds) playMoveSound(move);
  updateMoveList(move);
  engine.playMove(move, false);
  if (engine.inCheck && shouldPlaySounds) playSound("Check");
}

export function setBotEvaluation(bestMove, evaluation) {
  lastEvaluation.bestMove = bestMove;
  lastEvaluation.evaluation = engine.clrToMove == white ? evaluation : -evaluation;
}

window.redoMove = function () {
  if (engine.result == GameResult.inProgress) return;
  if (engine.redoHistory.length == 0) return;
  const moveToRedo = engine.redoHistory[engine.redoHistory.length - 1];
  playMoveSound(moveToRedo);
  engine.redoMove();
  if (engine.inCheck) playSound("Check");
};

window.undoMove = function () {
  if (engine.result == GameResult.inProgress) return;
  if (engine.moveHistory.length == 0) return;
  const moveToUndo = engine.moveHistory[engine.moveHistory.length - 1];
  engine.undoMove();
  playMoveSound(moveToUndo);
  if (engine.inCheck) playSound("Check");
};
