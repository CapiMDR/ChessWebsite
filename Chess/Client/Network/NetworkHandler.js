/*
 * Handles events from the server
 */

import { networkEvents } from "./ClientNetwork.js";
import { gameController } from "../Controllers/GameController.js";
import { clientState } from "../State/ClientState.js";

//Events from server
const networkEventHandlers = {
  joinMatch: joinServerGame,
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

//Rerceives assigned color from server
function joinServerGame(event) {
  clientState.setColor(event.detail.color);
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

function syncGameWithServer(gameStatus) {
  gameController.engine.clrToMove = gameStatus.clrToMove;
  gameController.engine.result = gameStatus.gameResult;
  gameController.whiteTimer.remainingTime = gameStatus.whiteTime;
  gameController.blackTimer.remainingTime = gameStatus.blackTime;
}
