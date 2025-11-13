/**
 * Handles board rendering (chess board, pieces, highlights, eval bar, etc.)
 * Uses shared input state from GameState.js
 */

import { BBUtil } from "../Shared/BBUtil.js";
import { Piece } from "../Shared/Piece.js";
import { Move } from "../Shared/Move.js";
import { BoardUtil } from "../Shared/BoardUtil.js";
import { white, pawn, knight, bishop, rook, queen, king, enPassantFlag } from "../Shared/Constants.js";
import { GameResult } from "../Shared/Engine.js";
import { clientColor, flipBoard } from "./ClientController.js";
import { gameController, engine, gameEvents } from "./GameController.js";
import { botEvents } from "./BotController.js";
import { networkEvents } from "./ClientNetwork.js";
import { selectedSquare, dragging, onPageLoaded } from "./ClientController.js";

// ====== Constants ======
const windowHeight = window.innerHeight;
export const boardSize = windowHeight * 0.9 * 0.8;
export const squareSize = boardSize / 8;
const evalBarThickness = windowHeight * 0.03;

// ====== Assets ======
let wP_Icon, wN_Icon, wB_Icon, wR_Icon, wQ_Icon, wK_Icon;
let bP_Icon, bN_Icon, bB_Icon, bR_Icon, bQ_Icon, bK_Icon;
let check_Glow, wood_Img;

// ====== Sounds ======
export let capture_Sound, move_Sound, check_Sound, gameOver_Sound, start_Sound, castle_Sound;

// ====== State ======
let playerNames = { white: null, black: null };
export let promotionMenu = { active: false, x: 0, y: 0, move: null, options: [5, 4, 3, 2] };
let botEvaluation = { bestMove: null, evaluation: 0, pv: null };
let currentEval = 0;

// ====== Events ======
networkEvents.addEventListener("startGame", (e) => {
  playerNames.white = e.detail.players.white.username;
  playerNames.black = e.detail.players.black.username;
});

botEvents.addEventListener("botEvaluation", (e) => updateBotEvaluation(e.detail));

gameEvents.addEventListener("moveUndo", () => {
  updateBotEvaluation({ bestMove: null, evaluation: 0, pv: null });
});

// ====== Exported p5 Sketch ======
export const BoardSketch = (p) => {
  // --- Preload Assets ---
  p.preload = () => {
    const piecesUrl = `../../Assets/Images/merida`;
    const soundUrl = `../../Assets/Sounds`;
    wP_Icon = p.loadImage(`${piecesUrl}/wP.svg`);
    wN_Icon = p.loadImage(`${piecesUrl}/wN.svg`);
    wB_Icon = p.loadImage(`${piecesUrl}/wB.svg`);
    wR_Icon = p.loadImage(`${piecesUrl}/wR.svg`);
    wQ_Icon = p.loadImage(`${piecesUrl}/wQ.svg`);
    wK_Icon = p.loadImage(`${piecesUrl}/wK.svg`);

    bP_Icon = p.loadImage(`${piecesUrl}/bP.svg`);
    bN_Icon = p.loadImage(`${piecesUrl}/bN.svg`);
    bB_Icon = p.loadImage(`${piecesUrl}/bB.svg`);
    bR_Icon = p.loadImage(`${piecesUrl}/bR.svg`);
    bQ_Icon = p.loadImage(`${piecesUrl}/bQ.svg`);
    bK_Icon = p.loadImage(`${piecesUrl}/bK.svg`);

    capture_Sound = p.loadSound(`${soundUrl}/captures.mp3`);
    move_Sound = p.loadSound(`${soundUrl}/move.mp3`);
    check_Sound = p.loadSound(`${soundUrl}/check.mp3`);
    gameOver_Sound = p.loadSound(`${soundUrl}/gameOver.mp3`);
    castle_Sound = p.loadSound(`${soundUrl}/castle.mp3`);
    start_Sound = p.loadSound(`${soundUrl}/start.mp3`);

    check_Glow = p.loadImage(`../../Assets/Images/Glow.png`);
    wood_Img = p.loadImage(`../../Assets/Images/BoardBg.jpg`);
  };

  // --- Setup ---
  p.setup = () => {
    const cnv = p.createCanvas(boardSize, boardSize);
    cnv.parent("boardContainer");
    onPageLoaded();
  };

  // --- Draw ---
  p.draw = () => {
    p.background(56);
    drawBoard(p);
    highlightSquares(p, engine, p.color(45, 221, 162, 180), p.color(211, 42, 50, 180));
    drawCheckBubble(p, engine);
    drawLegalMoves(p, engine, p.color(45, 221, 162, 180));
    drawPieces(p, engine);
    drawDraggedPiece(p, engine);
    drawBotAnalysis(p);
    if (promotionMenu.active) drawPromotionUI(p, engine);
    drawBotEval(p);
  };
};

// ====== Drawing Functions ======
function drawBoard(p) {
  const light = p.color("#EACCAE");
  const dark = p.color("#8B5D45");

  p.noStroke();
  p.rectMode(p.CORNER);
  p.textSize(16);
  p.textAlign(p.CENTER);

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const drawFile = adjustFile(f);
      const drawRank = adjustRank(r);

      p.fill(BoardUtil.isLightSquare(f, r) ? light : dark);
      p.rect(drawFile * squareSize, drawRank * squareSize, squareSize, squareSize);

      p.fill(BoardUtil.isLightSquare(f, r) ? dark : light);
      if (!flipBoard) {
        if (f === 0) p.text(8 - r, 10, squareSize * r + squareSize * 0.25);
        if (r === 7) p.text(String.fromCharCode(97 + f), squareSize * f + squareSize * 0.82, p.height - 10);
      } else {
        if (f === 7) p.text(8 - r, 10, squareSize * (7 - r) + squareSize * 0.25);
        if (r === 7) p.text(String.fromCharCode(104 - f), squareSize * f + squareSize * 0.82, p.height - 10);
      }
    }
  }

  // Wood texture overlay
  p.imageMode(p.CORNER);
  p.tint(255, 60);
  p.image(wood_Img, 0, 0, boardSize, boardSize);
  p.noTint();
}

function drawPieces(p, engine) {
  const board = engine.board;
  p.imageMode(p.CENTER);

  let allPieces = board.piecesBB;
  while (allPieces !== 0n) {
    const sqr = BBUtil.getLSBIndex(allPieces);
    allPieces &= allPieces - 1n;

    // Skip piece while dragging
    if (dragging && sqr === selectedSquare) continue;

    const file = BoardUtil.squareToFile(sqr);
    const rank = BoardUtil.squareToRank(sqr);
    const piece = board.piecesList[sqr];
    const img = getImageFromPiece(piece);

    const x = adjustFile(file) * squareSize + squareSize / 2;
    const y = adjustRank(rank) * squareSize + squareSize / 2;
    p.image(img, x, y, squareSize, squareSize);
  }
}

function drawDraggedPiece(p, engine) {
  if (!dragging || selectedSquare == null) return;
  const board = engine.board;
  if (!BBUtil.isBitSet(selectedSquare, board.piecesBB)) return;
  const piece = board.piecesList[selectedSquare];
  const img = getImageFromPiece(piece);
  p.image(img, p.mouseX, p.mouseY, squareSize * 1.2, squareSize * 1.2);
}

function highlightSquares(p, engine, selectedClr, moveClr) {
  p.noStroke();

  // Highlight selected square
  if (selectedSquare != null) {
    p.fill(selectedClr);
    const f = adjustFile(BoardUtil.squareToFile(selectedSquare));
    const r = adjustRank(BoardUtil.squareToRank(selectedSquare));
    p.rect(f * squareSize, r * squareSize, squareSize, squareSize);
  }

  // Highlight last move
  if (engine.moveHistory.length === 0) return;
  const lastMove = engine.moveHistory.at(-1);
  const s = Move.startSqr(lastMove);
  const t = Move.targetSqr(lastMove);

  const [sf, sr, tf, tr] = [
    adjustFile(BoardUtil.squareToFile(s)),
    adjustRank(BoardUtil.squareToRank(s)),
    adjustFile(BoardUtil.squareToFile(t)),
    adjustRank(BoardUtil.squareToRank(t)),
  ];

  p.fill(moveClr);
  p.rect(sf * squareSize, sr * squareSize, squareSize, squareSize);
  p.rect(tf * squareSize, tr * squareSize, squareSize, squareSize);
}

function drawLegalMoves(p, engine, clr) {
  if ((gameController.gameMode === "online" || gameController.gameMode === "bot") && clientColor !== engine.clrToMove) return;
  if (engine.result !== GameResult.inProgress || engine.isUndoingMoves()) return;
  if (selectedSquare == null) return;

  for (let move of engine.moves) {
    if (Move.startSqr(move) !== selectedSquare) continue;

    const f = BoardUtil.squareToFile(Move.targetSqr(move));
    const r = BoardUtil.squareToRank(Move.targetSqr(move));
    const x = adjustFile(f) * squareSize + squareSize / 2;
    const y = adjustRank(r) * squareSize + squareSize / 2;

    if (Move.isCapture(move, engine.board) && Move.flag(move) !== enPassantFlag) {
      p.noFill();
      p.stroke(clr);
      p.strokeWeight(10);
      p.ellipse(x, y, 60, 60);
    } else {
      p.noStroke();
      p.fill(clr);
      p.ellipse(x, y, squareSize * 0.4);
    }
  }
}

function drawCheckBubble(p, engine) {
  if (!engine.moveGenerator.inCheck) return;
  const kingBB = engine.clrToMove === white ? engine.board.white.king : engine.board.black.king;
  const kingSqr = BBUtil.getLSBIndex(kingBB);
  const f = adjustFile(BoardUtil.squareToFile(kingSqr));
  const r = adjustRank(BoardUtil.squareToRank(kingSqr));
  const x = f * squareSize + squareSize / 2;
  const y = r * squareSize + squareSize / 2;

  p.tint(255, 0, 0);
  p.imageMode(p.CENTER);
  p.image(check_Glow, x, y, squareSize * 2, squareSize * 2);
  p.noTint();
}

function drawPromotionUI(p, engine) {
  const { x, y, options } = promotionMenu;
  p.fill(255);
  p.stroke(0);
  p.strokeWeight(2);
  p.rectMode(p.CORNER);
  p.imageMode(p.CENTER);

  for (let i = 0; i < options.length; i++) {
    p.rect(x, y + i * squareSize, squareSize, squareSize);
    const img = getImageFromPiece(Piece.newPiece(options[i], engine.clrToMove));
    p.image(img, x + squareSize / 2, y + i * squareSize + squareSize / 2, squareSize, squareSize);
  }
}

function drawBotAnalysis(p) {
  const pv = botEvaluation.pv;
  if (!pv) return;

  const startC = p.color("#da2358");
  const endC = p.color("#0B5B99");

  for (let i = 0; i < pv.length; i++) {
    const move = pv[i];
    const s = Move.startSqr(move);
    const t = Move.targetSqr(move);
    const tVal = i / pv.length;
    const c = p.lerpColor(startC, endC, tVal);
    const thickness = p.map(i, 0, pv.length, 12, 2);
    drawArrow(p, s, t, c, thickness);
  }
}

function drawBotEval(p) {
  if (!(gameController.gameMode === "bot" || gameController.gameMode === "analyze")) return;

  const bestEval = 2000;
  const mateScore = 1e7;
  const lastEval = botEvaluation.evaluation;
  currentEval = Math.abs(lastEval) > mateScore - 1000 ? lastEval : p.lerp(currentEval, lastEval, 0.1);

  let evalText;
  if (Math.abs(currentEval) > mateScore - 1000) {
    const m = Math.floor((mateScore - Math.abs(currentEval)) * 0.5);
    evalText = m > 0 ? "M" + m : "1-0";
  } else {
    evalText = Math.abs(currentEval * 0.01).toFixed(1);
  }

  p.noStroke();
  p.fill(0);
  p.rect(boardSize, 0, evalBarThickness, p.height);
  p.fill(255);
  p.rect(boardSize, p.height, evalBarThickness, p.map(currentEval, -bestEval, bestEval, 0, -p.height));

  p.textSize(10);
  p.textAlign(p.CENTER);
  p.fill(currentEval >= 0 ? 0 : 255);
  p.text(evalText, boardSize + evalBarThickness / 2, currentEval >= 0 ? p.height - 20 : 20);
}

// ====== Helpers ======
function getImageFromPiece(piece) {
  const type = Piece.type(piece);
  const clr = Piece.clr(piece);
  switch (type) {
    case pawn:
      return clr === white ? wP_Icon : bP_Icon;
    case knight:
      return clr === white ? wN_Icon : bN_Icon;
    case bishop:
      return clr === white ? wB_Icon : bB_Icon;
    case rook:
      return clr === white ? wR_Icon : bR_Icon;
    case queen:
      return clr === white ? wQ_Icon : bQ_Icon;
    case king:
      return clr === white ? wK_Icon : bK_Icon;
  }
}

function drawArrow(p, fromSq, toSq, clr, thickness) {
  const fromFile = adjustFile(BoardUtil.squareToFile(fromSq));
  const fromRank = adjustRank(BoardUtil.squareToRank(fromSq));
  const toFile = adjustFile(BoardUtil.squareToFile(toSq));
  const toRank = adjustRank(BoardUtil.squareToRank(toSq));

  const x1 = fromFile * squareSize + squareSize / 2;
  const y1 = fromRank * squareSize + squareSize / 2;
  const x2 = toFile * squareSize + squareSize / 2;
  const y2 = toRank * squareSize + squareSize / 2;

  p.stroke(clr);
  p.strokeWeight(thickness);
  p.line(x1, y1, x2, y2);

  const angle = p.atan2(y2 - y1, x2 - x1);
  p.push();
  p.translate(x2, y2);
  p.rotate(angle + p.HALF_PI);
  p.noStroke();
  p.fill(clr);
  const size = 20;
  p.triangle(-size, size, size, size, 0, -size * 0.5);
  p.pop();
}

function updateBotEvaluation(botResult) {
  botEvaluation.bestMove = botResult.bestMove;
  botEvaluation.evaluation = engine.clrToMove === white ? -botResult.evaluation : botResult.evaluation;
  botEvaluation.pv = botResult.pv;
}

function adjustFile(file) {
  return flipBoard ? 7 - file : file;
}

function adjustRank(rank) {
  return flipBoard ? 7 - rank : rank;
}
