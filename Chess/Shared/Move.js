/*
Represented as 16 bits (FFFF TTTTTT SSSSSS):
  First 4 = Special move flags F (promotions, castling, etc)
  Second 6 = Target square T (0-63)
  Third 6 = Start square S (0-63)
*/
//Note: a8-a8 = invalid move

export class Move{
  static newMove(startSqr, targetSqr ,flag=0b0000){
    return startSqr | targetSqr<<6 | flag<<12;
  }
  
  static startSqr(move){
    return move & this.startSqrMask;
  }
  
  static targetSqr(move){
    return (move & this.targetSqrMask) >> 6;
  }
  
  static flag(move){
    return (move & this.flagMask) >> 12;
  }
  
  //Returns what the captured piece would be if the move were played
  //Note: the move must not have been played already
  static capturePiece(move, board){
    const enemyClr=(board.clrToMove==white) ? black : white;
    if(this.flag(move)==enPassantFlag) return Piece.newPiece(pawn,enemyClr);
    const capturedPiece=board.piecesList[this.targetSqr(move)];
    return Piece.newPiece(capturedPiece,enemyClr);
  }
  
  //Returns what the captured piece type would be if the move were played
  //Note: the move must not have been played already
  static capturePieceType(move, board){
    if(this.flag(move)==enPassantFlag) return pawn;
    const capturedPiece=board.piecesList[this.targetSqr(move)];
    return Piece.type(capturedPiece);
  }
  
  //Returns if the move is a capture
  //Note: the move must not have been played already
  static isCapture(move, board){
    return this.capturePieceType(move,board)!=none;
  }
  
  //Prints move in 16-bit binary format OR in square (UCI) notation (ex: e2e4)
  static toString(move, sendBinary=false){
    if(sendBinary) return move.toString(2).padStart(16, '0');
    
    const startSqr=this.startSqr(move);
    const targetSqr=this.targetSqr(move);
    let moveString=BoardUtil.sqrToString(startSqr)+BoardUtil.sqrToString(targetSqr)
    const flag=this.flag(move);
    
    switch(flag){
      case promoteKnightFlag : moveString+='n';
        break;
      case promoteBishopFlag : moveString+='b';
        break;
      case promoteRookFlag : moveString+='r';
        break;
      case promoteQueenFlag : moveString+='q';
        break;
    }
    
    return moveString;
  }
  
  static isPromotion(move){
    const moveFlag = this.flag(move);
    return (moveFlag==promoteKnightFlag) || (moveFlag==promoteBishopFlag) || (moveFlag==promoteRookFlag) || (moveFlag==promoteQueenFlag);
  }
  
  //Gets a move in UCI format and transforms it to 16 bits for internal representation (ex e4 = e2e4 -> 0b11100100110100)
  //The board before the move is played is needed to identify its flag correctly
  static UCIToMove(uci, board){
    //First two characters are the starting square
    const startSquareName=uci.charAt(0) + uci.charAt(1);
    //Second two characters are the target square
    const targetSquareName=uci.charAt(2) + uci.charAt(3);
    
    const startSquare=BoardUtil.nameToSquare(startSquareName);
    const startFile=BoardUtil.squareToFile(startSquare);
    const startRank=BoardUtil.squareToRank(startSquare);
    
    const targetSquare=BoardUtil.nameToSquare(targetSquareName);
    const targetFile=BoardUtil.squareToFile(targetSquare);
    const targetRank=BoardUtil.squareToRank(targetSquare);
    
    const movedPieceType=Piece.type(board.piecesList[startSquare]);
    
    let moveFlag=noFlag;
    
    if(movedPieceType==pawn){
      if(uci.length==5){ //If there is a fifth character it represents a promotion type
        switch(uci.charAt(4)){
          case 'n': moveFlag=promoteKnightFlag;
          break
          case 'b': moveFlag=promoteBishopFlag;
          break;
          case 'r': moveFlag=promoteRookFlag;
          break;
          case 'q': moveFlag=promoteQueenFlag;
          break;
        }
      }else if(Math.abs(targetRank-startRank)==2){ //If the pawn is moving 2 ranks it is a double push
        moveFlag=pawnTwoMoveFlag;
      }else if(startFile!=targetFile && Piece.type(board.piecesList[targetSquare])==none){
        //If the pawn is changing files but there is no piece in its target square it's en passant
        moveFlag=enPassantFlag;
      }
    }
    
    //If the king is moving 2 squares it must be castling
    if(movedPieceType==king && Math.abs(targetFile-startFile)==2){
      moveFlag=castleFlag;
    }
    return this.newMove(startSquare,targetSquare,moveFlag);
  }
}

Move.startSqrMask=0b0000000000111111;
Move.targetSqrMask=0b0000111111000000;
Move.flagMask=0b1111000000000000;