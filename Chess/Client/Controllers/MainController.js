/*
 * Master controller for the client. Reacts accordingly based on the selected game mode
 */

import "../Network/NetworkHandler.js";
import { GameResult } from "../../Shared/Engine.js";
import { sendToServer, startConnection } from "../Network/ClientNetwork.js";
import { botController } from "./BotController.js";
import { gameController, gameEvents } from "./GameController.js";
import { uiController } from "./UIController.js";
import { white, black } from "../../Shared/Constants.js";
import { clientState } from "../State/ClientState.js";

const modeHandlers = {
  online: handleOnlineMode,
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

function handleAnalyzeMode() {
  botController.initializeBot();
  gameController.importSANGame(window.movesList);
  gameController.handleGameStart();
  //Set client color to spectator to stop them from making moves during analysis
  clientState.setColor("spectator");
  //Ending the game in case it ended halfway through it (timeout/resignation)
  gameController.handleGameEnd(GameResult.Analyzing);
}

gameEvents.addEventListener("startGame", handleBotMode);

//Bot mode is handled when the game is started, not when the page is loaded
function handleBotMode() {
  if (gameMode != "bot") return;
  const difficulty = window.gameOptions["difficulty"];
  botController.initializeBot(difficulty);

  //Determine client color (white / black / random)
  let selectedColor = window.gameOptions["color"];
  if (selectedColor === "random") {
    selectedColor = Math.random() < 0.5 ? "white" : "black";
  }

  clientState.setColor(selectedColor === "white" ? white : black);

  //If the client is black, let the bot play first
  if (clientState.color === black) {
    botController.startBotSearch(gameController.engine.board, "search");
  }
}

//On local move registered events
const modeMoveHandlers = {
  online: handleOnlineMove,
  bot: letBotMove,
  local: handleLocalMove,
};

//Registers a move played locally. If multiplayer, sends it to the server for validation, otherwise just plays it immediately
export function registerMove(playedMove) {
  if (!gameController.canAcceptLocalMove()) return;
  const handler = modeMoveHandlers[gameController.gameMode];
  if (handler) handler(playedMove);
}

function handleOnlineMove(playedMove) {
  //Only send move to server if it's this client's turn
  if (clientState.color == gameController.engine.clrToMove) {
    sendToServer({ type: "move", move: playedMove });
  }
}

function letBotMove(playedMove) {
  //Let the bot play if bot mode and player just moved
  if (gameController.engine.clrToMove == clientState.color) {
    gameController.playMoveLocally(playedMove);
    botController.startBotSearch(gameController.engine.board, "search");
  }
}

function handleLocalMove(playedMove) {
  //If localmode play the move immediately
  gameController.playMoveLocally(playedMove);
  clientState.flipBoard = gameController.engine.clrToMove == black ? true : false;
}

export function resignGame() {
  if (gameController.engine.result != GameResult.inProgress) return;
  sendToServer({ type: "resignation" });
}

export function getHint() {
  uiController.glowHintButton();
  botController.startBotSearch(gameController.engine.board, "evaluate");
}
