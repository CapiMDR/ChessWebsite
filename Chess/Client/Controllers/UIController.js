/**
 * Handles all non-board-drawing (DOM elements), sounds and UI related functions
 */

import { Move } from "../../Shared/Move.js";
import { Piece } from "../../Shared/Piece.js";
import { none, enPassantFlag, castleFlag } from "../../Shared/Constants.js";
import { botEvents } from "./BotController.js";
import { gameController, gameEvents, engine } from "./GameController.js";
import { resignGame, getHint } from "./MainController.js";
import { capture_Sound, move_Sound, check_Sound, gameOver_Sound, start_Sound, castle_Sound } from "../Renderers/BoardRenderer.js";

export class UIController {
  handleGameStart() {
    document.getElementById("overlay").style.display = "none"; //Disabling shadow over canvas
    const resignBtn = document.getElementById("resignBTN");
    if (resignBtn) {
      resignBtn.classList.remove("btn-styled-disabled");
      resignBtn.classList.add("btn-styled");
      resignBtn.classList.add("scalable");
    }
    this.playSound("Start");
  }

  handleGameEnd() {
    const undoMoveBtn = document.getElementById("undoMoveBTN");
    undoMoveBtn.classList.remove("btn-styled-disabled");
    undoMoveBtn.classList.add("btn-styled");
    undoMoveBtn.classList.add("scalable");
    const redoMoveBtn = document.getElementById("redoMoveBTN");
    redoMoveBtn.classList.remove("btn-styled-disabled");
    redoMoveBtn.classList.add("btn-styled");
    redoMoveBtn.classList.add("scalable");

    const resignBtn = document.getElementById("resignBTN");
    if (resignBtn) {
      resignBtn.classList.add("btn-styled-disabled");
      resignBtn.classList.remove("btn-styled");
      resignBtn.classList.remove("scalable");
    }
    this.playSound("End");
  }

  playSound(type) {
    type = type.toLowerCase();
    switch (type) {
      case "start":
        if (start_Sound != null) start_Sound.play();
        break;
      case "end":
        if (gameOver_Sound != null) gameOver_Sound.play();
        break;
      case "check":
        if (check_Sound != null) check_Sound.play();
        break;
      default:
        console.log("Invalid sound type: " + type);
    }
  }

  //NOTE: Move must not have been played already to play the right sound
  playMoveSound(move) {
    const flag = Move.flag(move);
    const targetSquare = Move.targetSqr(move);
    const capturedPiece = engine.board.piecesList[targetSquare];
    const capturedPieceType = Piece.type(capturedPiece);

    if (flag == castleFlag) {
      castle_Sound.play();
      return;
    }

    if (capturedPieceType != none || flag == enPassantFlag) {
      capture_Sound.play();
      return;
    }

    move_Sound.play();
  }

  //Update moves list UI to show the SAN notation of all moves
  //NOTE: Must be called before move is made to show the proper move
  addToMoveList(move) {
    const movesList = document.getElementById("movesList");

    const engine = gameController.engine;
    const moveListItems = movesList.getElementsByTagName("li");

    //Convert move to SAN (standard algebraic notation)
    const uciMove = Move.toString(move);
    const sanMove = Move.UCIToSAN(uciMove, engine.board);

    if (!sanMove) return; //Invalid move, skip

    //If this is white's move (even index), create a new <li>
    if (engine.moveHistory.length % 2 === 0) {
      const moveListItem = document.createElement("li");
      moveListItem.textContent = sanMove;
      movesList.appendChild(moveListItem);
    } else {
      //Otherwise (black's move), append to the last <li>
      const lastItem = moveListItems[moveListItems.length - 1];
      if (lastItem) lastItem.textContent += " " + sanMove;
    }
    movesList.scrollTop = movesList.scrollHeight;
  }

  removeFromMoveList() {
    const movesList = document.getElementById("movesList");
    const moveListItems = movesList.getElementsByTagName("li");

    if (moveListItems.length === 0) return; //Nothing to remove

    const lastItem = moveListItems[moveListItems.length - 1];
    const text = lastItem.textContent.trim();

    //Split the content into individual SAN moves
    const parts = text.split(/\s+/);

    if (parts.length <= 1) {
      //Only one move (likely white's move at start of turn)
      movesList.removeChild(lastItem);
    } else {
      //Remove the last move (likely black's move)
      parts.pop();
      lastItem.textContent = parts.join(" ") + " ";
    }
  }

  glowHintButton() {
    //Giving a glow effect to the hint button while waiting for the bot's result
    const hintBtn = document.getElementById("hintBTN");
    if (hintBtn) {
      hintBtn.classList.add("btn-glowing");
    }
  }

  unglowHintButton() {
    const hintBtn = document.getElementById("hintBTN");
    if (hintBtn) {
      hintBtn.classList.remove("btn-glowing");
    }
  }
}

const actions = {
  startGame: () => gameController.handleGameStart(),
  resign: () => resignGame(),
  getHint: () => getHint(),
  undoMove: () => gameController.undoMove(),
  redoMove: () => gameController.redoMove(),
};

//Adding a listener to the html buttons to handle their respective functions
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-action]").forEach((button) => {
    const action = button.dataset.action;
    const handler = actions[action];
    if (handler) button.addEventListener("click", handler);
    else console.warn("Unhandled button action: ", action);
  });
});

//Listen for bot evaluations and stop the glowing button
botEvents.addEventListener("botEvaluation", () => {
  uiController.unglowHintButton();
});

const gameEventHandlers = {
  startGame: () => uiController.handleGameStart(),
  endGame: () => uiController.handleGameEnd(),
  movePlayed: onMovePlayed,
  moveUndo: onMoveUndo,
  inCheck: (e) => {
    if (e.detail.shouldPlaySounds) uiController.playSound("check");
  },
};

Object.entries(gameEventHandlers).forEach(([eventType, handler]) => {
  gameEvents.addEventListener(eventType, handler);
});

function onMovePlayed(e) {
  if (e.detail.shouldPlaySounds) uiController.playMoveSound(e.detail.move);
  uiController.addToMoveList(e.detail.move);
}

function onMoveUndo(e) {
  uiController.playMoveSound(e.detail.move);
  uiController.removeFromMoveList(e.detail.move);
}

export const uiController = new UIController();
