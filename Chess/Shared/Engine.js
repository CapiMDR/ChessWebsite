//Interface between player and chess board
//Keeps track of move history to undo and calculates game result after every move

import { Board } from "./Board.js";
import { Move } from "./Move.js";
import { MoveGenerator } from "./MoveGenerator.js";
import { Piece } from "./Piece.js";
import { BBUtil } from "./BBUtil.js";
import { BoardUtil } from "./BoardUtil.js";
import { standardPieceValues, white, black, none, pawn, knight, bishop, rook, queen } from "./Constants.js";

export class Engine {
  constructor(FEN) {
    this.board = new Board();
    this.board.fillBoard(FEN);
    this.moveGenerator = new MoveGenerator();
    this.moves = []; //List of legal moves for the current position

    this.moveHistory = []; //Stack for all moves played
    this.redoHistory = []; //Stack for redoing moves after undoing them

    this.clrToMove = this.board.clrToMove;
    this.inCheck = false; //If any king is in check in the current position
    this.result = GameResult.starting;
    this.gameIsOver = false;

    //Holds 2 timers indexed by color
    this.timers = [];

    //Keeps the amount of pieces that have been captured for either color indexed by piece (see Piece.js for explanation)
    this.capturedPieceCounts = new Array(15).fill(0);
    //Initial material value for both colors
    this.whiteMaterial = this.board.getColorMaterial(white, standardPieceValues);
    this.blackMaterial = this.board.getColorMaterial(black, standardPieceValues);
  }

  setTimers(whiteTimer, blackTimer) {
    this.timers[white] = whiteTimer;
    this.timers[black] = blackTimer;
  }

  startGame() {
    if (this.result != GameResult.starting) return;
    this.result = GameResult.inProgress;
    this.runGame();
  }

  runGame() {
    this.clrToMove = this.board.clrToMove;
    this.moves = this.moveGenerator.generateMoves(this.board);
    this.inCheck = this.moveGenerator.inCheck;
    const plyCounter = this.board.plyCounter;

    this.whiteMaterial = this.board.getColorMaterial(white, standardPieceValues);
    this.blackMaterial = this.board.getColorMaterial(black, standardPieceValues);

    //Checking game result after every move
    if (this.moves.length == 0) {
      this.result = this.inCheck ? this.getCheckmateResult() : GameResult.stalemate;
    }

    if (plyCounter >= 100) this.result = GameResult.fiftyMoveRule;
    if (this.isThreefoldRepetition()) this.result = GameResult.drawByRepetition;
    if (this.isInsufficientMaterial()) this.result = GameResult.insufficientMaterial;
    this.manageTimers();
    if (this.result != GameResult.inProgress && !this.gameIsOver) this.gameIsOver = true;
  }

  //For both players & bots, final moves must be made through this function for the game to update correctly
  //Moves can be played directly on the board.makeMove for evaluation though
  playMove(move, redoingMove = false) {
    this.updateCapturedArrays(move, false);
    this.board.makeMove(move);
    this.moveHistory.push(move);
    if (!redoingMove) this.redoHistory = [];
    this.runGame();
  }

  //Undoes the last played move, to undo any move without updating results use board.unmakeMove instead
  undoMove() {
    if (this.moveHistory.length == 0) return;
    const moveToUndo = this.moveHistory.pop();
    this.redoHistory.push(moveToUndo);

    this.board.unmakeMove(moveToUndo);
    this.updateCapturedArrays(moveToUndo, true);
    this.runGame();
  }

  //Updates captured pieces arrays after every played move
  updateCapturedArrays(move, undoingMove = false) {
    const capturedPiece = Move.capturePiece(move, this.board);
    const capturedPieceType = Piece.type(capturedPiece);
    if (capturedPieceType == none) return;

    const multiplier = undoingMove == false ? 1 : -1;
    const capturedPieceClr = Piece.clr(capturedPiece);
    this.capturedPieceCounts[Piece.newPiece(capturedPieceType, capturedPieceClr)] += 1 * multiplier;
  }

  //Redoes the last undone move
  redoMove() {
    if (this.redoHistory.length == 0) return;
    const moveToRedo = this.redoHistory.pop();
    this.playMove(moveToRedo, true);
  }

  isUndoingMoves() {
    return this.redoHistory.length != 0;
  }

  manageTimers() {
    const currentTurnTimer = this.timers[this.clrToMove];
    const otherClr = this.clrToMove == white ? black : white;
    const otherTimer = this.timers[otherClr];

    if (currentTurnTimer != undefined) currentTurnTimer.start();

    if (this.result == GameResult.inProgress) {
      if (currentTurnTimer != undefined) currentTurnTimer.play();
      //Since pausing increments the time, only pause the second clock after its first move (second clock hasn't been started anyways)
      if (otherTimer != undefined && this.moveHistory.length > 0) otherTimer.pause();
    } else {
      if (currentTurnTimer != undefined) currentTurnTimer.stop();
      if (otherTimer != undefined) otherTimer.stop();
    }
  }

  getCheckmateResult() {
    return this.clrToMove == white ? GameResult.blackCheckmated : GameResult.whiteCheckmated;
  }

  isThreefoldRepetition() {
    const currentKey = this.board.zobristKey;
    let count = 0;
    for (let hash of this.board.repetitionHistory) {
      if (hash == currentKey) count++;
      if (count >= 3) return true;
    }
    return false;
  }

  //TODO: Check if this covers all draw cases
  isInsufficientMaterial() {
    const pieceCounts = this.board.pieceCounts;
    const whitePieceCount = pieceCounts[white][0];
    const blackPieceCount = pieceCounts[black][0];
    const allPieceCount = whitePieceCount + blackPieceCount;
    const pawnsCount = pieceCounts[white][pawn] + pieceCounts[black][pawn];
    const knightsCount = pieceCounts[white][knight] + pieceCounts[black][knight];
    const whiteBishopsCount = pieceCounts[white][bishop];
    const blackBishopsCount = pieceCounts[white][bishop];
    const bishopsCount = pieceCounts[white][bishop] + pieceCounts[black][bishop];
    const rooksCount = pieceCounts[white][rook] + pieceCounts[black][rook];
    const queensCount = pieceCounts[white][queen] + pieceCounts[black][queen];

    //Pawns prevent draw by insufficient material
    if (pawnsCount > 0) return false;

    //Rooks and queens prevent draws too
    if (rooksCount > 0 || queensCount > 0) return false;

    //King vs king = draw
    //Since the king can never be captured, if both colors only have 1 piece (kings) it's a draw
    if (whitePieceCount == 1 && blackPieceCount == 1) return true;

    //King + bishop vs king = draw
    //2 kings + 1 bishop of any color
    if (allPieceCount == 3 && bishopsCount == 1) return true;

    //King + knight vs king = draw
    //2 kings + 1 knight of any color
    if (allPieceCount == 3 && knightsCount == 1) return true;

    //King + bishop vs king + bishop = draw (when they are the same color only)
    //2 kings + 2 bishops
    if (allPieceCount == 4 && whiteBishopsCount == 1 && blackBishopsCount == 1) {
      //Get both bishop squares
      const whiteBishopSqr = BBUtil.getLSBIndex(this.board.white.bishops);
      const blackBishopSqr = BBUtil.getLSBIndex(this.board.black.bishops);
      //If they are on the same square color return true, otherwise false
      return BoardUtil.isLightSquare(whiteBishopSqr) == BoardUtil.isLightSquare(blackBishopSqr);
    }

    return false;
  }

  restartGame() {
    this.board.init();
    this.board.fillBoard(startFEN);

    this.moveHistory = [];
    this.redoHistory = [];

    this.capturedPieceCounts = new Array(15).fill(0);
    this.whiteMaterial = this.board.getColorMaterial(white, standardPieceValues);
    this.blackMaterial = this.board.getColorMaterial(black, standardPieceValues);

    this.result = GameResult.starting;
  }

  //Validates a given FEN String
  isValidFEN(fen) {
    const parts = fen.trim().split(/\s+/);
    //piece placement, color to move, castling rights, en passant file (or ""-"" if none)
    if (parts.length < 1) return "Missing piece placement";
    if (parts.length < 2) return "Missing color to move";
    if (parts.length < 3) return "Missing castling rights (- if none)";
    if (parts.length < 4) return "Missing En passant file (- if none)";

    const [placement, activeColor, castling, enPassant, halfmove, fullmove] = parts;

    const rows = placement.split("/");
    if (rows.length != 8) return "Found: " + rows.length + " rows (expected 8)"; //Need 8 rows

    //Each row must sum to 8 squares
    for (const row of rows) {
      let count = 0;
      for (const c of row) {
        if (/[1-8]/.test(c)) count += parseInt(c, 10);
        else if (/[prnbqkPRNBQK]/.test(c)) count += 1;
        else return "Invalid character found: " + c; //Invalid character
      }
      if (count != 8) return "Found: " + count + " columns (expected 8)";
    }

    //Check color to move
    if (!/^[wb]$/.test(activeColor)) return "Invalid color to move";

    //Check castling rights
    if (!/^(K?Q?k?q?|-)$/i.test(castling)) return "Invalid castling rights";

    //Check en passant (either "-" or valid square)
    if (!/^(-|[a-h][36])$/.test(enPassant)) return "Invalid En passant file";

    return "Valid FEN";
  }
}

export const GameResult = Object.freeze({
  starting: "Starting the game",
  inProgress: "In Progress",
  whiteCheckmated: "White Checkmated",
  whiteResigned: "White resigned",
  blackResigned: "Black resigned",
  blackCheckmated: "Black Checkmated",
  whiteTimeOut: "White ran out of time",
  blackTimeOut: "Black ran out of time",
  insufficientMaterial: "Draw due to insufficient material",
  fiftyMoveRule: "Draw due to fifty move rule",
  stalemate: "Stalemate",
  drawByRepetition: "Draw by 3 fold repetition",
});
