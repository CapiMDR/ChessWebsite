//Runs a game locally using the moves/results received from the server
import { GameResult } from "../Shared/Engine.js";
import { sendToServer, startConnection, networkEvents } from "./ClientNetwork.js";
import { botController } from "./BotController.js";
import { gameController } from "./GameController.js";
import { uiController } from "./UIController.js";
import { white, black } from "../Shared/Constants.js";

export let clientColor; //Color assigned to this client by the server
clientColor = white; //TEMPORARY DEFAULT ASSIGNMENT TO WHITE FOR PLAYING AGAINST THE BOT UNTIL USER SELECTION IS ALLOWED BEFORE GAME START
export let flipBoard; //Controls whether the board should be drawn in black's perspective

const modeHandlers = {
  online: handleOnlineMode,
  bot: handleBotMode,
  local: handleLocalMode,
  analyze: handleAnalyzeMode,
};

//Called from Renderer.js, figure out which game mode this client is on and act accordingly
export function onPageLoaded() {
  if (gameController.engine.result !== GameResult.starting) return;
  const handler = modeHandlers[gameController.gameMode];
  if (handler) handler();
  else console.warn("Unhandled gamemode type: ", gameController.gameMode);
}

function handleOnlineMode() {
  startConnection();
  //If online mode, tell server this client is ready
  sendToServer({ type: "ready" });
}

function handleBotMode() {
  botController.initializeBot();
  flipBoard = clientColor === black;
}

function handleLocalMode() {
  flipBoard = clientColor === black;
}

function handleAnalyzeMode() {
  botController.initializeBot();
  gameController.importSANGame(window.movesList);
  gameController.handleGameStart();
  //Set client color to spectator to stop them from making moves during analysis
  clientColor = "spectator";
  //Ending the game in case it ended halfway through it (timeout/resignation)
  gameController.handleGameEnd(GameResult.Analyzing);
}

//On local move registered events
const modeMoveHandlers = {
  online: handleOnlineMove,
  bot: handleBotMove,
  local: handleLocalMove,
};

//Registers a move played locally. If multiplayer, sends it to the server for validation, otherwise just plays it immediately
export function registerMove(playedMove) {
  //Don't register any move locally if undoing moves
  if (gameController.engine.isUndoingMoves()) return;
  if (!gameController.gameInProgress()) return;

  const handler = modeMoveHandlers[gameController.gameMode];
  if (handler) handler(playedMove);
}

function handleOnlineMove(playedMove) {
  //Only send move to server if it's this client's turn
  if (clientColor == gameController.engine.clrToMove) {
    sendToServer({ type: "move", move: playedMove });
  }
}

function handleBotMove(playedMove) {
  //Let the bot play if bot mode and player just moved
  if (gameController.engine.clrToMove == clientColor) {
    gameController.playMoveLocally(playedMove);
    botController.startBotSearch(gameController.engine.board, "search");
  }
}

function handleLocalMove(playedMove) {
  //If localmode play the move immediately
  gameController.playMoveLocally(playedMove);
  flipBoard = gameController.engine.clrToMove == black ? true : false;
}

//Events from server
const networkEventHandlers = {
  joinMatch: onJoinMatch,
  move: onMove,
  syncGame: onSyncGame,
};

//Add all event listener from the serverEventHandlers automatically
Object.keys(networkEventHandlers).forEach((eventType) => {
  networkEvents.addEventListener(eventType, handleNetworkEvent);
});

function handleNetworkEvent(event) {
  const handler = networkEventHandlers[event.type];
  if (handler) handler(event);
  else console.warn("Unhandled event: ", event.type);
}

function onJoinMatch(event) {
  joinServerGame(event.detail.color);
}

function onMove(event) {
  gameController.playMoveLocally(event.detail.move);
  syncGameWithServer(event.detail.gameStatus);
}

function onSyncGame(event) {
  playAllServerMoves(event.detail.gameStatus);
  syncGameWithServer(event.detail.gameStatus);
}

function playAllServerMoves(gameStatus) {
  //Playing all moves played so far on local board if a client disconnects and reconnects
  for (let move of gameStatus.movesList) {
    gameController.playMoveLocally(move, false);
  }
}

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

// Shared input + board interaction state
export let selectedSquare = null;
export let selectToggle = true;
export let dragging = false;

export function setSelectedSquare(square) {
  selectedSquare = square;
}

export function toggleSelect(currentSquare) {
  selectToggle = !selectToggle;
  if (selectedSquare !== currentSquare) selectToggle = false;
}

export function resetSelection() {
  selectedSquare = null;
  selectToggle = true;
}

export function setDragging(value) {
  dragging = value;
}
