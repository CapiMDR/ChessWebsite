//Runs a game locally using the moves/results received from the server
import { GameResult } from "../Shared/Engine.js";
import { sendToServer, startConnection, serverEvents } from "./ClientNetwork.js";
import { botController, botEvents } from "./BotController.js";
import { gameController } from "./GameController.js";
import { uiController } from "./UIController.js";
import { white, black } from "../Shared/Constants.js";

export let clientColor; //Color assigned to this client by the server
clientColor = white; //TEMPORARY DEFAULT ASSIGNMENT TO WHITE FOR PLAYING AGAINST THE BOT UNTIL USER SELECTION IS ALLOWED BEFORE GAME START
export let flipBoard; //Controls whether the board should be drawn in black's perspective

//Called from Renderer.js, figure out which game mode this client is on and act accordingly
export function onPageLoaded() {
  if (gameController.engine.result != GameResult.starting) return;
  switch (gameController.gameMode) {
    case "online":
      //If online mode, tell server this client is ready
      startConnection();
      sendToServer({ type: "ready" });
      break;
    case "bot":
      botController.initializeBot();
      flipBoard = clientColor == black ? true : false;
      break;
    case "local":
      flipBoard = clientColor == black ? true : false;
      break;
    case "analyze":
      botController.initializeBot();
      gameController.importSANGame(window.movesList);
      gameController.handleGameStart();
      //Set client color to spectator to stop them from making moves during analysis
      clientColor = "spectator";
      //Stopping both timers in case the game ended by resignation halfway through it
      gameController.engine.timers[white].stop();
      gameController.engine.timers[black].stop();
      gameController.engine.result = GameResult.Analyzing;
      break;
  }
}

//Registers a move played locally. If multiplayer, sends it to the server for validation, otherwise just plays it immediately
export function registerMove(playedMove) {
  //Don't register any move locally if undoing moves
  if (gameController.engine.isUndoingMoves()) return;

  switch (gameController.gameMode) {
    case "online":
      //Only send move to server if it's this client's turn
      if (clientColor == gameController.engine.clrToMove) sendToServer({ type: "move", move: playedMove });
      break;
    case "bot":
      //Let the bot play if bot mode and player just moved
      if (gameController.engine.clrToMove == clientColor) {
        gameController.playMoveLocally(playedMove);
        botController.startBotSearch(gameController.engine.board, "search");
      }
      break;
    case "local":
      //If localmode play the move immediately
      gameController.playMoveLocally(playedMove);
      flipBoard = gameController.engine.clrToMove == black ? true : false;
      break;
  }
}

//Listen for server events
serverEvents.addEventListener("joinMatch", handleEvent);
serverEvents.addEventListener("move", handleEvent);
serverEvents.addEventListener("syncGame", handleEvent);

function handleEvent(event) {
  switch (event.type) {
    case "joinMatch":
      joinServerGame(event.detail.color);
      break;
    case "move":
      gameController.playMoveLocally(event.detail.move);
      syncGameWithServer(event.detail.gameStatus);
      break;
    case "syncGame":
      playAllServerMoves(event.detail.gameStatus);
      syncGameWithServer(event.detail.gameStatus);
      break;
    default:
      console.warn("Unhandled event:", event.type);
  }
}

function playAllServerMoves(gameStatus) {
  //Playing all moves played so far on local board if a client disconnects and reconnects
  for (let move of gameStatus.movesList) {
    gameController.playMoveLocally(move, false);
  }
}

//Listen for bot moves and play them locally
botEvents.addEventListener("botMove", (e) => {
  gameController.playMoveLocally(e.detail);
});

//Rerceives assigned color from server
function joinServerGame(color) {
  clientColor = color;
  flipBoard = clientColor == black ? true : false;
}

function syncGameWithServer(gameStatus) {
  gameController.engine.clrToMove = gameStatus.clrToMove;
  gameController.engine.result = gameStatus.gameResult;
  gameController.whiteTimer.remainingTime = gameStatus.whiteTime;
  gameController.blackTimer.remainingTime = gameStatus.blackTime;
}

export function resignGame() {
  if (gameController.engine.result != GameResult.inProgress) return;
  sendToServer({ type: "resignation" });
}

export function getHint() {
  uiController.glowHintButton();
  botController.startBotSearch(gameController.engine.board, "evaluate");
}

window.redoMove = function () {
  if (!gameController.gameIsOver()) return;
  if (gameController.engine.redoHistory.length == 0) return;
  const moveToRedo = gameController.engine.redoHistory[gameController.engine.redoHistory.length - 1];
  uiController.playMoveSound(moveToRedo);
  gameController.engine.redoMove();
  if (gameController.engine.inCheck) uiController.playSound("Check");
};

window.undoMove = function () {
  if (!gameController.gameIsOver()) return;
  if (gameController.engine.moveHistory.length == 0) return;
  const moveToUndo = gameController.engine.moveHistory[gameController.engine.moveHistory.length - 1];
  gameController.engine.undoMove();
  uiController.playMoveSound(moveToUndo);
  if (gameController.engine.inCheck) uiController.playSound("Check");
};
