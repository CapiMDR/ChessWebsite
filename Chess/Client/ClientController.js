//Runs a game locally using the moves/results received from the server
import { Timer } from "../Shared/Timer.js";
import { Engine, GameResult } from "../Shared/Engine.js";
import { playMoveSound, playSound, updateMoveList, lastEvaluation } from "./Renderer.js";
import { sendToServer, startConnection } from "./ClientNetwork.js";
import { initializeBot, startBotSearch } from "./BotController.js";
import { white, black } from "../Shared/Constants.js";
import { Move } from "../Shared/Move.js";

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
export let flipBoard; //Controls whether the board should be drawn in black's perspective
export let joinedMatchID; //The current match ID assigned to this client by the server

//Minutes & increment in seconds
whiteTimer = new Timer(whiteMinutes, whiteIncrementSeconds);
blackTimer = new Timer(blackMinutes, blackIncrementSeconds);
engine.setTimers(whiteTimer, blackTimer);

//Listening to timer events
whiteTimer.addEventListener("timeout", () => handleLocalTimeout(white));
blackTimer.addEventListener("timeout", () => handleLocalTimeout(black));

function handleLocalTimeout(color) {
  //Ignore local time outs if playing online (wait for server to notify game over)
  if (gameMode == "online") return;
  const result = color === white ? GameResult.whiteTimeOut : GameResult.blackTimeOut;
  handleGameEnd(result);
}

export function onPageLoaded() {
  switch (gameMode) {
    case "online":
      //If online mode, tell server this client is ready
      startConnection();
      sendToServer({ type: "ready" });
      break;
    case "bot":
      initializeBot();
      flipBoard = clientColor == black ? true : false;
      break;
    case "local":
      flipBoard = clientColor == black ? true : false;
      break;
    case "analyze":
      initializeBot();
      importSANGame(window.movesList);
      handleGameStart();
      //Set client color to spectator to stop them from making moves during analysis
      clientColor = "spectator";
      //Stopping both timers in case the game ended by resignation halfway through it
      engine.timers[white].stop();
      engine.timers[black].stop();
      engine.result = GameResult.Analyzing;
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
export function joinServerGame(matchID, color) {
  clientColor = color;
  flipBoard = clientColor == black ? true : false;
  joinedMatchID = matchID;
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

export function resignGame() {
  if (engine.result != GameResult.inProgress) return;
  sendToServer({ type: "resignation" });
}

export function getHint() {
  //Giving a glow effect to the hint button while waiting for the bot's result
  const hintBtn = document.getElementById("hintBTN");
  if (hintBtn) {
    hintBtn.classList.add("btn-glowing");
  }
  startBotSearch(engine.board, "evaluate");
}

export function handleGameEnd(result) {
  engine.result = result;
  engine.timers[white].stop();
  engine.timers[black].stop();
  playSound("End");
}

//Registers a move played locally. If multiplayer, sends it to the server for validation, otherwise just plays it immediately
export function registerMove(playedMove) {
  if (engine.result != GameResult.inProgress) return;
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
        startBotSearch(engine.board, "search");
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
  if (gameIsOver()) return;

  //TODO: Allow for move undoing/redoing during the game and resynching the board when a new move arrives
  if (shouldPlaySounds) playMoveSound(move);
  updateMoveList(move);
  engine.playMove(move, false);
  if (engine.inCheck && shouldPlaySounds) playSound("Check");

  if (gameMode == "local") {
    flipBoard = engine.clrToMove == black ? true : false;
  }

  //Handle local game end (only when not playing online as that should stay server-authoritative)
  if (gameMode == "online") return;
  if (gameIsOver()) handleGameEnd(engine.result);
}

export function setBotEvaluation(bestMove, evaluation, principalVariation) {
  const hintBtn = document.getElementById("hintBTN");
  if (hintBtn) {
    hintBtn.classList.remove("btn-glowing");
  }
  lastEvaluation.bestMove = bestMove;
  //The bot always returns a positive score when it is winning, so multiply by -1 when black is winning for standard visualization
  lastEvaluation.evaluation = engine.clrToMove == white ? evaluation : -evaluation;
  lastEvaluation.pv = principalVariation;
}

window.redoMove = function () {
  if (!gameIsOver()) return;
  if (engine.redoHistory.length == 0) return;
  setBotEvaluation(null, 0, null);
  const moveToRedo = engine.redoHistory[engine.redoHistory.length - 1];
  playMoveSound(moveToRedo);
  engine.redoMove();
  if (engine.inCheck) playSound("Check");
};

window.undoMove = function () {
  if (!gameIsOver()) return;
  if (engine.moveHistory.length == 0) return;
  setBotEvaluation(null, 0, null);
  const moveToUndo = engine.moveHistory[engine.moveHistory.length - 1];
  engine.undoMove();
  playMoveSound(moveToUndo);
  if (engine.inCheck) playSound("Check");
};

function gameIsOver() {
  return engine.result != GameResult.starting && engine.result != GameResult.inProgress;
}

//Imports a game written in UCI format (ex e2e4)
function importUCIGame(movesString) {
  const movePattern = /\b[a-h][1-8][a-h][1-8][qrbn]?\b/g;
  const moveArray = movesString.match(movePattern) || [];
  for (let UCImove of moveArray) {
    const move = Move.UCIToMove(UCImove, engine.board);
    playMoveLocally(move, false);
  }
}

//Imports a game written in SAN format (ex Nf3)
function importSANGame(movesString) {
  //Remove move numbers like "1-e4", "2-Nf3", "3..." etc.
  const sanitized = movesString.replace(/\d+[-.]/g, "");

  //Split by whitespace to get individual SAN moves
  const sanMoves = sanitized.trim().split(/\s+/);

  for (let sanMove of sanMoves) {
    //Convert SAN → UCI using your SANToUCI method
    const uci = Move.SANToUCI(sanMove, engine.board);

    if (!uci) {
      console.warn("Could not convert SAN move:", sanMove);
      continue;
    }

    const move = Move.UCIToMove(uci, engine.board);
    playMoveLocally(move, false);
  }
}
