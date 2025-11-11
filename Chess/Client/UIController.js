/**
 * Handles all non-board-drawing UI related functions
 */

import { Move } from "../Shared/Move.js";
import { Piece } from "../Shared/Piece.js";
import { engine } from "./GameController.js";
import { none, enPassantFlag, castleFlag } from "../Shared/Constants.js";
import { botEvents } from "./BotController.js";
import { gameController } from "./GameController.js";
import { resignGame, getHint } from "./ClientController.js";
import { capture_Sound, move_Sound, check_Sound, gameOver_Sound, start_Sound, castle_Sound } from "./Renderer.js";

//Listen for bot moves and play them locally
botEvents.addEventListener("botEvaluation", () => {
  uiController.unglowHintButton();
});

export class UIController {
  playSound(type) {
    switch (type) {
      case "Start":
        start_Sound.play();
        break;
      case "End":
        gameOver_Sound.play();
        break;
      case "Check":
        check_Sound.play();
        break;
    }
  }

  //Notes: Move must not have been played already to play the right sound. This function does not play check sounds
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

  updateMoveList(move) {
    //Update moves list UI to show the SAN notation of all moves
    const movesList = document.getElementById("movesList");
    const moveListItems = movesList.getElementsByTagName("li");
    const uciMove = Move.toString(move);
    const sanMove = Move.UCIToSAN(uciMove, engine.board);
    if (engine.moveHistory.length % 2 == 0) {
      const moveListItem = document.createElement("li");
      movesList.appendChild(moveListItem);
    }

    moveListItems[moveListItems.length - 1].textContent += " " + sanMove + " ";
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

//Adding a listener to the html buttons to handle their respective functions
document.addEventListener("DOMContentLoaded", () => {
  const playBtn = document.getElementById("playBTN");
  if (playBtn) {
    playBtn.addEventListener("click", gameController.handleGameStart.bind(gameController));
  }

  const resignBtn = document.getElementById("resignBTN");
  if (resignBtn) {
    resignBtn.addEventListener("click", resignGame);
  }

  const hintBtn = document.getElementById("hintBTN");
  if (hintBtn) {
    hintBtn.addEventListener("click", getHint);
  }
});

export const uiController = new UIController();
