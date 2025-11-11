//Handles all user input methods (clicking/dragging pieces)
import { squareSize, promotionMenu, boardSize } from "./Renderer.js";
import { Move } from "../Shared/Move.js";
import { BoardUtil } from "../Shared/BoardUtil.js";
import { GameResult } from "../Shared/Engine.js";
import { knight, bishop, rook, queen, promoteKnightFlag, promoteBishopFlag, promoteRookFlag, promoteQueenFlag } from "../Shared/Constants.js";
import { registerMove, flipBoard } from "./ClientController.js";
import { engine } from "./GameController.js";

export let selectedSquare;
export let selectToggle = true;
export let dragging = false;

window.touchStarted = function () {
  if (engine.result == GameResult.starting) return;
  const { currentFile, currentRank, currentSquare } = getCurrentMouseCoords(mouseX, mouseY);

  if (promotionMenu.active) {
    const playedMove = handlePromotionClick(currentFile, currentRank);
    if (playedMove != undefined) registerMove(playedMove);
    return;
  }

  if (BoardUtil.outOfBounds(currentFile, currentRank)) {
    selectedSquare = undefined;
    return;
  }

  if (selectedSquare != undefined) {
    const playedMove = searchMoves(selectedSquare, currentSquare);
    if (playedMove != undefined) {
      registerMove(playedMove);
      selectedSquare = undefined;
      return;
    }
  }

  selectToggle = !selectToggle;
  if (selectedSquare != currentSquare) selectToggle = false;
  selectedSquare = currentSquare;
};

window.touchMoved = function () {
  if (engine.result == GameResult.starting) return;
  dragging = true;
};

window.touchEnded = function () {
  if (engine.result == GameResult.starting) return;
  dragging = false;
  if (selectedSquare == undefined) return;
  const { currentFile: releasedFile, currentRank: releasedRank, currentSquare: releasedSquare } = getCurrentMouseCoords(mouseX, mouseY);

  if (BoardUtil.outOfBounds(releasedFile, releasedRank)) return;

  //If the promotion UI is active, don't get a new move
  if (promotionMenu.active) return;
  const playedMove = searchMoves(selectedSquare, releasedSquare);
  if (playedMove != undefined) registerMove(playedMove);

  if (releasedSquare != selectedSquare || selectToggle || (releasedSquare == selectedSquare && dragging)) {
    selectedSquare = undefined;
  }
};

function searchMoves(moveFrom, moveTo) {
  const moveToFile = BoardUtil.squareToFile(moveTo);
  const moveToRank = BoardUtil.squareToRank(moveTo);
  //Looking for a move that matches with the user input
  for (let move of engine.moves) {
    const moveStartSqr = Move.startSqr(move);
    const moveTargetSqr = Move.targetSqr(move);
    if (moveStartSqr != moveFrom || moveTargetSqr != moveTo) continue;

    if (Move.isPromotion(move)) {
      //Open promotion menu at the target square
      let x = flipBoard ? boardSize - moveToFile * squareSize - squareSize : moveToFile * squareSize;
      let y = flipBoard ? boardSize - moveToRank * squareSize - squareSize : moveToRank * squareSize;

      promotionMenu.active = true;
      promotionMenu.x = x;
      promotionMenu.y = y;
      promotionMenu.move = move;
      return undefined; //Wait for user to choose promotion
    }
    return move; //Return the move if it wasn't a promotion
  }
  return undefined;
}

//Handles clicks whenever the promotion menu is active
function handlePromotionClick(file, rank) {
  selectedSquare = undefined;
  const { x, y, options, move } = promotionMenu;

  const menuFile = floor(x / squareSize);
  const menuRank = floor(y / squareSize);

  const adjustedFile = flipBoard ? 7 - file : file;
  const adjustedRank = flipBoard ? 7 - rank : rank;

  if (adjustedFile == menuFile) {
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
      //If the user clicked on a piece image, make the promotion
      promotionMenu.active = false;
      return Move.newMove(startSquare, targetSquare, promotionFlag);
    }
  }
  //Otherwise just close the promotion menu
  promotionMenu.active = false;
  return undefined;
}

//Gets the file, rank and square indeces the mouse is over. Canvas coordinates to chess coordinates
function getCurrentMouseCoords(x, y) {
  const file = floor(x / squareSize);
  const rank = floor(y / squareSize);

  const realFile = flipBoard ? 7 - file : file;
  const realRank = flipBoard ? 7 - rank : rank;

  return { currentFile: realFile, currentRank: realRank, currentSquare: BoardUtil.indexToSquare(realFile, realRank) };
}
