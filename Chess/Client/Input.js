/**
 * Handles all user input (clicking, dragging pieces)
 * Works with the BoardRenderer.js p5 instance
 */

import { Move } from "../Shared/Move.js";
import { GameResult } from "../Shared/Engine.js";
import { BoardUtil } from "../Shared/BoardUtil.js";
import { knight, bishop, rook, queen, promoteKnightFlag, promoteBishopFlag, promoteRookFlag, promoteQueenFlag } from "../Shared/Constants.js";
import { registerMove } from "./Controllers/MainController.js";
import { clientState } from "./State/ClientState.js";
import { engine } from "./Controllers/GameController.js";
import { squareSize, promotionMenu, boardSize } from "./Renderers/BoardRenderer.js";
import { boardP5 } from "./Renderers/MainRenderer.js";
import { selectedSquare, selectToggle, dragging, setSelectedSquare, toggleSelect, resetSelection, setDragging } from "./State/InputState.js";

// --- Attach input handlers to the board's p5 instance ---
boardP5.touchStarted = function () {
  if (engine.result === GameResult.starting) return;

  const { currentFile, currentRank, currentSquare } = getCurrentMouseCoords(this.mouseX, this.mouseY);

  if (promotionMenu.active) {
    const playedMove = handlePromotionClick(currentFile, currentRank);
    if (playedMove) registerMove(playedMove);
    return;
  }

  if (BoardUtil.outOfBounds(currentFile, currentRank)) {
    resetSelection();
    return;
  }

  if (selectedSquare !== null) {
    const playedMove = searchMoves(selectedSquare, currentSquare);
    if (playedMove) {
      registerMove(playedMove);
      resetSelection();
      return;
    }
  }

  toggleSelect(currentSquare);
  setSelectedSquare(currentSquare);
};

boardP5.touchMoved = function () {
  if (engine.result === GameResult.starting) return;
  setDragging(true);
};

boardP5.touchEnded = function () {
  if (engine.result === GameResult.starting) return;
  setDragging(false);

  if (selectedSquare === null) return;

  const { currentFile, currentRank, currentSquare } = getCurrentMouseCoords(this.mouseX, this.mouseY);
  if (BoardUtil.outOfBounds(currentFile, currentRank)) return;

  if (promotionMenu.active) return;

  const playedMove = searchMoves(selectedSquare, currentSquare);
  if (playedMove) registerMove(playedMove);

  if (currentSquare !== selectedSquare || selectToggle || dragging) {
    resetSelection();
  }
};

// --- Helper functions ---
function searchMoves(moveFrom, moveTo) {
  const moveToFile = BoardUtil.squareToFile(moveTo);
  const moveToRank = BoardUtil.squareToRank(moveTo);

  for (let move of engine.moves) {
    const moveStartSqr = Move.startSqr(move);
    const moveTargetSqr = Move.targetSqr(move);
    if (moveStartSqr !== moveFrom || moveTargetSqr !== moveTo) continue;

    if (Move.isPromotion(move)) {
      const x = clientState.flipBoard ? boardSize - moveToFile * squareSize - squareSize : moveToFile * squareSize;
      const y = clientState.flipBoard ? boardSize - moveToRank * squareSize - squareSize : moveToRank * squareSize;

      promotionMenu.active = true;
      promotionMenu.x = x;
      promotionMenu.y = y;
      promotionMenu.move = move;
      return undefined;
    }

    return move;
  }
  return undefined;
}

function handlePromotionClick(file, rank) {
  resetSelection();
  const { x, y, options, move } = promotionMenu;

  const menuFile = Math.floor(x / squareSize);
  const menuRank = Math.floor(y / squareSize);

  const adjustedFile = clientState.flipBoard ? 7 - file : file;
  const adjustedRank = clientState.flipBoard ? 7 - rank : rank;

  if (adjustedFile === menuFile) {
    const optionIndex = adjustedRank - menuRank;
    if (optionIndex >= 0 && optionIndex < options.length) {
      const startSquare = Move.startSqr(move);
      const targetSquare = Move.targetSqr(move);

      const selected = options[optionIndex];
      let promotionFlag;
      switch (selected) {
        case knight:
          promotionFlag = promoteKnightFlag;
          break;
        case bishop:
          promotionFlag = promoteBishopFlag;
          break;
        case rook:
          promotionFlag = promoteRookFlag;
          break;
        case queen:
          promotionFlag = promoteQueenFlag;
          break;
      }

      promotionMenu.active = false;
      return Move.newMove(startSquare, targetSquare, promotionFlag);
    }
  }

  promotionMenu.active = false;
  return undefined;
}

function getCurrentMouseCoords(x, y) {
  const file = Math.floor(x / squareSize);
  const rank = Math.floor(y / squareSize);

  const realFile = clientState.flipBoard ? 7 - file : file;
  const realRank = clientState.flipBoard ? 7 - rank : rank;

  return {
    currentFile: realFile,
    currentRank: realRank,
    currentSquare: BoardUtil.indexToSquare(realFile, realRank),
  };
}
