//Handles all user input methods (clicking/dragging pieces)

import { chess, squareSize, promotionMenu, lastBestMove, playMoveSound } from './sketch.js';
import { sendToServer } from './client.js';
import { GameResult } from '../Shared/Engine.js';
import { BBUtil } from '../Shared/BBUtil.js';
import { Move } from '../Shared/Move.js';
import { BoardUtil } from '../Shared/BoardUtil.js';
import{ white, black, pawn, knight, bishop, rook, queen } from '../Shared/Constants.js';

export let selectedSquare;
export let selectToggle=true;
export let dragging=false;

window.touchStarted = function() {
  if(chess.result==GameResult.starting) return;
  
  const currentFile=Math.floor(mouseX/squareSize);
  const currentRank=Math.floor(mouseY/squareSize);
  const currentSquare=BoardUtil.indexToSquare(currentFile,currentRank);
  
  if(promotionMenu.active){
    const playedMove=handlePromotionClick(currentFile, currentRank);
    if(playedMove!=undefined){
      sendToServer({
        type: 'move',
        move: playedMove
      });
    }
    return;
  }
  
  if(BoardUtil.outOfBounds(currentFile,currentRank)){
    selectedSquare=undefined;
    return;
  }
  
  if(selectedSquare!=undefined){ 
    const playedMove=searchMoves(selectedSquare, currentSquare);
    if(playedMove!=undefined){
      sendToServer({
        type: 'move',
        move: playedMove
      });
      selectedSquare=undefined;
      return;
    }
  }
  
  selectToggle=!selectToggle;
  if(selectedSquare!=currentSquare) selectToggle=false;
  selectedSquare=currentSquare;
}

window.touchMoved = function() {
  dragging=true;
}

window.touchEnded = function() {
  dragging=false
  if(selectedSquare==undefined) return;
  const releasedFile=Math.floor(mouseX/squareSize);
  const releasedRank=Math.floor(mouseY/squareSize);
  
  const releasedSquare=BoardUtil.indexToSquare(releasedFile,releasedRank);
  if(BoardUtil.outOfBounds(releasedFile, releasedRank)) return;
  
  //If the promotion UI is active, don't get a new move
  if(promotionMenu.active) return;
  
  const playedMove=searchMoves(selectedSquare, releasedSquare);
  if(playedMove!=undefined){
    sendToServer({
      type: 'move',
      move: playedMove
    });
  }
  
  if(releasedSquare!=selectedSquare || selectToggle || (releasedSquare==selectedSquare && dragging)){
    selectedSquare=undefined;
  }
}

function searchMoves(moveFrom, moveTo){
  const moveToFile=BoardUtil.squareToFile(moveTo);
  const moveToRank=BoardUtil.squareToRank(moveTo);
  //Looking for a move that matches with the user input
  for(let move of chess.moves){
    const moveStartSqr=Move.startSqr(move);
    const moveTargetSqr=Move.targetSqr(move);
    if(moveStartSqr!=moveFrom || moveTargetSqr!=moveTo) continue;
    
    if(Move.isPromotion(move)){
      //Open promotion menu at the target square
      promotionMenu.active = true;
      promotionMenu.x = moveToFile * squareSize;
      promotionMenu.y = (chess.clrToMove==white) ? moveToRank*squareSize : (moveToRank-3) * squareSize;
      promotionMenu.move = move;
      return undefined; //Wait for user to choose promotion
    }
    //lastBestMove=undefined;
    return move; //Return the move if it wasn't a promotion
  }
  return undefined;
}

function handlePromotionClick(file, rank) {
  selectedSquare = undefined;
  const {x, y, options, move} = promotionMenu;
  const menuFile = x / squareSize;
  const menuRank = y / squareSize;
  if(file == menuFile){
    const optionIndex = rank - menuRank;
    if(optionIndex >= 0 && optionIndex < options.length){
      const startSquare=Move.startSqr(move);
      const targetSquare=Move.targetSqr(move);
      
      const selected = options[optionIndex];
      let promotionFlag;
      switch(selected){
        case knight: promotionFlag = promoteKnightFlag; break;
        case bishop: promotionFlag = promoteBishopFlag; break;
        case rook: promotionFlag = promoteRookFlag; break;
        case queen: promotionFlag = promoteQueenFlag; break;
      }

      //Playing a move with the set promotion flag
      promotionMenu.active = false;
      const newMove = Move.newMove(startSquare,targetSquare,promotionFlag);
      return newMove;
    }
  }

  promotionMenu.active = false;
  return undefined;
}

window.keyPressed = function() {
  //Skip inputs if selecting a text field
  const active = document.activeElement;
  if(active.tagName=="INPUT" || active.tagName=="TEXTAREA") return;
  
  //Let CapraStar (AI) evaluate the current position
  if (key === 'w') {
    console.log("Evaluating position with CapraStar...")
    capraStar.postMessage({
      type: 'evaluate',
      fen: chess.board.toFEN(true),
      repetitionHistory: chess.board.repetitionHistory
    });
  }
  
  //Clear the evaluation
  if (key === 's') {
    lastEval=0;
    lastBestMove=null;
  }
  
  //Undo last move
  if (key === 'a') {
    chess.undoMove();
  }
  
  //Redo last undone move
  if (key === 'd') {
    chess.redoMove();
  }
}