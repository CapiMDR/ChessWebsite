//Handles canvas (board, timers, etc) drawing and sounds
import { BBUtil } from "../Shared/BBUtil.js";
import { Piece } from "../Shared/Piece.js";
import { Move } from "../Shared/Move.js";
import { BoardUtil } from "../Shared/BoardUtil.js";
import { white, black, none, pawn, knight, bishop, rook, queen, king, enPassantFlag, castleFlag } from "../Shared/Constants.js";
import { selectedSquare, dragging } from "./Input.js";
import { GameResult } from "../Shared/Engine.js";
import { engine, clientColor, flipBoard, onPageLoaded, gameMode } from "./ClientController.js";

const windowHeight = window.innerHeight;
export const boardSize = windowHeight * 0.9 * 0.8;
export const squareSize = boardSize / 8;
const evalBarThickness = windowHeight * 0.03;
const UISize = windowHeight * 0.6 * 0.8;
const UICenter = boardSize + (UISize + evalBarThickness) * 0.5;

let wP_Icon;
let wN_Icon;
let wB_Icon;
let wR_Icon;
let wQ_Icon;
let wK_Icon;

let bP_Icon;
let bN_Icon;
let bB_Icon;
let bR_Icon;
let bQ_Icon;
let bK_Icon;

let check_Glow;
let wood_Img;

let capture_Sound;
let move_Sound;
let check_Sound;
export let gameOver_Sound;
export let start_Sound;
let castle_Sound;

window.preload = function () {
  const piecesUrl = `../../Assets/Images/merida`;
  const soundUrl = `../../Assets/Sounds`;

  wP_Icon = loadImage(`${piecesUrl}/wP.svg`);
  wN_Icon = loadImage(`${piecesUrl}/wN.svg`);
  wB_Icon = loadImage(`${piecesUrl}/wB.svg`);
  wR_Icon = loadImage(`${piecesUrl}/wR.svg`);
  wQ_Icon = loadImage(`${piecesUrl}/wQ.svg`);
  wK_Icon = loadImage(`${piecesUrl}/wK.svg`);

  bP_Icon = loadImage(`${piecesUrl}/bP.svg`);
  bN_Icon = loadImage(`${piecesUrl}/bN.svg`);
  bB_Icon = loadImage(`${piecesUrl}/bB.svg`);
  bR_Icon = loadImage(`${piecesUrl}/bR.svg`);
  bQ_Icon = loadImage(`${piecesUrl}/bQ.svg`);
  bK_Icon = loadImage(`${piecesUrl}/bK.svg`);

  capture_Sound = loadSound(`${soundUrl}/captures.mp3`);
  move_Sound = loadSound(`${soundUrl}/move.mp3`);
  check_Sound = loadSound(`${soundUrl}/check.mp3`);
  gameOver_Sound = loadSound(`${soundUrl}/gameOver.mp3`);
  castle_Sound = loadSound(`${soundUrl}/castle.mp3`);
  start_Sound = loadSound(`${soundUrl}/start.mp3`);

  check_Glow = loadImage(`../../Assets/Images/Glow.png`);
  wood_Img = loadImage(`../../Assets/Images/BoardBg.jpg`);
};

window.setup = function () {
  const cnv = createCanvas(boardSize + UISize, boardSize);
  cnv.parent("canvasContainer");
  onPageLoaded();
};

export function setupBoard(FEN) {
  engine.board.init();
  engine.board.fillBoard(FEN.trim());
}

window.draw = function () {
  //background(251,251,251);
  //background(245);
  background(56);
  drawBoard();
  highlightSquares(engine, color(45, 221, 162, 180), color(211, 42, 50, 180));
  drawCheckBubble(engine);
  drawLegalMoves(engine, color(45, 221, 162, 180));
  drawPieces(engine);

  //debugView(engine);

  drawBotAnalysis();
  drawUIText(engine);
  drawUITimers(engine);
  drawCapturedPieces(engine);
  if (promotionMenu.active) drawPromotionUI(engine);
  drawBotEval(engine);
  drawDraggedPiece(engine);
};

function drawBoard() {
  noStroke();
  rectMode(CORNER);
  textSize(16);
  textAlign(CENTER);

  const lightSquareColor = color("#EACCAE");
  const darkSquareColor = color("#8B5D45");

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const drawFile = adjustFile(f);
      const drawRank = adjustRank(r);

      //Squares
      const isLightSquare = BoardUtil.isLightSquare(f, r);
      fill(isLightSquare ? lightSquareColor : darkSquareColor);
      rect(drawFile * squareSize, drawRank * squareSize, squareSize, squareSize);

      //Text
      fill(isLightSquare ? darkSquareColor : lightSquareColor);
      if (!flipBoard) {
        if (f == 0) text(8 - r, 10, squareSize * r + squareSize * 0.25);
        if (r == 7) text(String.fromCharCode(97 + f), squareSize * f + squareSize * 0.82, height - 10);
      } else {
        if (f == 7) text(8 - r, 10, squareSize * (7 - r) + squareSize * 0.25);
        if (r == 7) text(String.fromCharCode(104 - f), squareSize * f + squareSize * 0.82, height - 10);
      }
    }
  }

  imageMode(CORNER);
  tint(255, 60);
  image(wood_Img, 0, 0, boardSize, boardSize);
  tint(255);
}

function drawPieces(engine) {
  const board = engine.board;
  imageMode(CENTER);

  let allPieces = board.piecesBB;
  while (allPieces != 0n) {
    const sqr = BBUtil.getLSBIndex(allPieces);
    allPieces &= allPieces - 1n;

    //Skip if drawing dragged piece (handled later)
    if (dragging && sqr == selectedSquare) continue;

    const file = BoardUtil.squareToFile(sqr);
    const rank = BoardUtil.squareToRank(sqr);
    const piece = board.piecesList[sqr];
    const img = getImageFromPiece(piece);

    const drawFile = adjustFile(file) * squareSize + squareSize / 2;
    const drawRank = adjustRank(rank) * squareSize + squareSize / 2;

    image(img, drawFile, drawRank, squareSize, squareSize);
  }
}

function drawDraggedPiece(engine) {
  if (selectedSquare === undefined) return;
  if (!dragging) return;
  if (!BBUtil.isBitSet(selectedSquare, engine.board.piecesBB)) return;

  const piece = engine.board.piecesList[selectedSquare];
  const img = getImageFromPiece(piece);

  image(img, mouseX, mouseY, squareSize * 1.2, squareSize * 1.2);
}

function drawCapturedPieces(engine) {
  const valueDifference = engine.whiteMaterial - engine.blackMaterial;
  const drawSize = squareSize * 0.5;
  const drawLocation = boardSize + 50;
  const spacing = 12;

  let whiteOffset = 0;
  let blackOffset = 0;

  for (let piece of Piece.indeces) {
    const capturedAmount = engine.capturedPieceCounts[piece];
    let img = getImageFromPiece(piece);
    for (let i = 0; i < capturedAmount; i++) {
      if (Piece.clr(piece) == white) {
        image(img, drawLocation + whiteOffset, 50, drawSize, drawSize);
        whiteOffset += spacing;
      } else {
        image(img, drawLocation + blackOffset, height - 50, drawSize, drawSize);
        blackOffset += spacing;
      }
    }
  }

  fill(255);
  textSize(12);
  textAlign(CENTER);
  if (valueDifference < 0) {
    text("+" + abs(valueDifference), drawLocation + whiteOffset + 20, 50);
  } else if (valueDifference > 0) {
    text("+" + valueDifference, drawLocation + blackOffset + 20, height - 50);
  }
}

function drawLegalMoves(engine, clr = color(0)) {
  //Only draw legal moves if it's this client's turn
  if ((gameMode == "online" || gameMode == "bot") && clientColor != engine.clrToMove) return;
  if (engine.result != GameResult.inProgress) return;
  if (engine.isUndoingMoves()) return;

  for (let move of engine.moves) {
    const startSquare = Move.startSqr(move);
    const targetSquare = Move.targetSqr(move);
    if (startSquare != selectedSquare) continue;

    const file = BoardUtil.squareToFile(targetSquare);
    const rank = BoardUtil.squareToRank(targetSquare);
    const drawFile = adjustFile(file) * squareSize + squareSize / 2;
    const drawRank = adjustRank(rank) * squareSize + squareSize / 2;

    if (Move.isCapture(move, engine.board) && Move.flag(move) != enPassantFlag) {
      //If capture, draw a hollow circle
      noFill();
      stroke(clr);
      strokeWeight(10);
      ellipse(drawFile, drawRank, 60, 60);
    } else {
      //Otherwise, draw normal filled dot
      fill(clr);
      noStroke();
      ellipse(drawFile, drawRank, squareSize * 0.4);
    }
  }
}

function getImageFromPiece(piece) {
  const pieceType = Piece.type(piece);
  const pieceColor = Piece.clr(piece);
  let img;
  switch (pieceType) {
    case pawn:
      img = pieceColor == white ? wP_Icon : bP_Icon;
      break;
    case knight:
      img = pieceColor == white ? wN_Icon : bN_Icon;
      break;
    case bishop:
      img = pieceColor == white ? wB_Icon : bB_Icon;
      break;
    case rook:
      img = pieceColor == white ? wR_Icon : bR_Icon;
      break;
    case queen:
      img = pieceColor == white ? wQ_Icon : bQ_Icon;
      break;
    case king:
      img = pieceColor == white ? wK_Icon : bK_Icon;
      break;
  }
  return img;
}

function highlightSquares(engine, selectedClr = color(0), moveClr = color(0)) {
  noStroke();
  //Highlight selected piece original square
  if (selectedSquare != undefined) {
    fill(selectedClr);
    const selectedFile = BoardUtil.squareToFile(selectedSquare);
    const selectedRank = BoardUtil.squareToRank(selectedSquare);
    const drawFile = adjustFile(selectedFile);
    const drawRank = adjustRank(selectedRank);
    rect(drawFile * squareSize, drawRank * squareSize, squareSize, squareSize);
  }

  //Highlight last move's start and target squares
  if (engine.moveHistory.length == 0) return;
  const lastMove = engine.moveHistory[engine.moveHistory.length - 1];

  const startSquare = Move.startSqr(lastMove);
  const targetSquare = Move.targetSqr(lastMove);

  const startFile = BoardUtil.squareToFile(startSquare);
  const startRank = BoardUtil.squareToRank(startSquare);
  const targetFile = BoardUtil.squareToFile(targetSquare);
  const targetRank = BoardUtil.squareToRank(targetSquare);

  const drawStartFile = adjustFile(startFile);
  const drawStartRank = adjustRank(startRank);
  const drawTargetFile = adjustFile(targetFile);
  const drawTargetRank = adjustRank(targetRank);

  fill(moveClr);
  rect(drawStartFile * squareSize, drawStartRank * squareSize, squareSize, squareSize);
  rect(drawTargetFile * squareSize, drawTargetRank * squareSize, squareSize, squareSize);
}

function drawCheckBubble(engine) {
  //Draw red circle around king in check (if any)
  if (!engine.moveGenerator.inCheck) return;
  imageMode(CENTER);
  const kingBB = engine.clrToMove == white ? engine.board.white.king : engine.board.black.king;
  const kingSqr = BBUtil.getLSBIndex(kingBB);
  const kingFile = BoardUtil.squareToFile(kingSqr);
  const kingRank = BoardUtil.squareToRank(kingSqr);

  tint(255, 0, 0);
  const drawFile = adjustFile(kingFile) * squareSize + squareSize * 0.5;
  const drawRank = adjustRank(kingRank) * squareSize + squareSize * 0.5;

  image(check_Glow, drawFile, drawRank, squareSize * 2, squareSize * 2);
  noTint();
}

function drawUIText(engine) {
  fill(255);
  noStroke();
  textSize(16);
  textAlign(CENTER);
  if (engine.result == GameResult.inProgress) {
    text(engine.clrToMove == white ? "White to move" : "Black to move", UICenter, height / 2);
  } else {
    text(engine.result, UICenter, height / 2);
  }
}

function drawUITimers(engine) {
  textAlign(CENTER, CENTER);
  rectMode(CENTER);

  const timerWidth = UISize * 0.3;
  const timerHeight = UISize * 0.15;

  //Positions depending on flip
  const whiteY = flipBoard ? height / 4 : (3 * height) / 4;
  const blackY = flipBoard ? (3 * height) / 4 : height / 4;

  // --- White Timer ---
  let opacity = engine.clrToMove == white ? 255 : 100;
  if (engine.timers[white] != undefined) {
    fill(255, opacity);
    if (engine.clrToMove == white) setGlow();
    rect(UICenter, whiteY, timerWidth, timerHeight, 5);
    unsetEffects();
    fill(0, opacity);
    text(engine.timers[white].getTime(), UICenter, whiteY);
  }

  // --- Black Timer ---
  opacity = engine.clrToMove == black ? 255 : 100;
  if (engine.timers[black] != undefined) {
    fill(0, opacity);
    if (engine.clrToMove == black) setGlow();
    rect(UICenter, blackY, timerWidth, timerHeight, 5);
    unsetEffects();
    fill(255, opacity);
    text(engine.timers[black].getTime(), UICenter, blackY);
  }
}

export let promotionMenu = {
  active: false,
  x: 0,
  y: 0,
  move: null,
  options: [5, 4, 3, 2],
};

function drawPromotionUI(engine) {
  fill(255);
  stroke(0);
  strokeWeight(2);
  rectMode(CORNER);
  imageMode(CENTER);
  const { x, y, options } = promotionMenu;
  for (let i = 0; i < options.length; i++) {
    rect(x, y + i * squareSize, squareSize, squareSize);
    let img = getImageFromPiece(Piece.newPiece(options[i], engine.clrToMove));
    const drawFile = x + squareSize / 2;
    const drawRank = y + i * squareSize + squareSize / 2;
    image(img, drawFile, drawRank, squareSize, squareSize);
  }
}

//Draws arrow between two squares
function drawArrow(fromSq, toSq, clr = color(0), thickness) {
  //Convert square index into file/rank
  let fromFile = adjustFile(BoardUtil.squareToFile(fromSq));
  let fromRank = adjustRank(BoardUtil.squareToRank(fromSq));
  let toFile = adjustFile(BoardUtil.squareToFile(toSq));
  let toRank = adjustRank(BoardUtil.squareToRank(toSq));

  //Convert to pixel coordinates (center of each square)
  const x1 = fromFile * squareSize + squareSize / 2;
  const y1 = fromRank * squareSize + squareSize / 2;
  const x2 = toFile * squareSize + squareSize / 2;
  const y2 = toRank * squareSize + squareSize / 2;

  //Draw main arrow line
  stroke(clr);
  strokeWeight(thickness);
  line(x1, y1, x2, y2);

  //Draw arrowhead
  const angle = atan2(y2 - y1, x2 - x1);
  push();
  translate(x2, y2);
  rotate(angle + HALF_PI);
  noStroke();
  fill(clr);
  const size = 20;
  triangle(-size, size, size, size, 0, -size * 0.5);
  pop();
}

export const lastEvaluation = {
  bestMove: null,
  evaluation: 0,
  pv: null,
};

//Draws arrows to represent the principal variation (best moves for either side to a static depth) after CapraStar evaluation
function drawBotAnalysis() {
  const pv = lastEvaluation.pv;
  if (!pv) return;

  let baseColorStart = color("#da2358");
  let baseColorEnd = color("#0B5B99");

  for (let i = 0; i < pv.length; i++) {
    const move = pv[i];
    const startSquare = Move.startSqr(move);
    const targetSquare = Move.targetSqr(move);

    const targetFile = BoardUtil.squareToFile(targetSquare);
    const targetRank = BoardUtil.squareToRank(targetSquare);

    //Interpolate color along PV
    const t = i / pv.length;
    const c = lerpColor(baseColorStart, baseColorEnd, t);

    const thickness = map(i, 0, pv.length, 12, 2);

    drawArrow(startSquare, targetSquare, c, thickness);

    fill(255);
    noStroke();
    textSize(18);
    text(i + 1, squareSize * targetFile + 10, squareSize * targetRank + squareSize * 0.25);
  }
}

let currentEval = 0;

//Draws CapraStar's evaluation if active
function drawBotEval() {
  if (!(gameMode == "bot" || gameMode == "analyze")) return;
  const bestEvaluation = 2000; //How "great" should the evaluation be to cover the entire bar
  const mateScore = 10000000; //The highest score a bot can give to a move (mate next move)

  const lastEval = lastEvaluation.evaluation;
  //If it's a mate score, skip interpolation so the bar jumps instantly
  if (Math.abs(lastEval) > mateScore - 1000) {
    currentEval = lastEval;
  } else {
    currentEval = lerp(currentEval, lastEval, 0.1);
  }

  let evalText;
  if (Math.abs(currentEval) > mateScore - 1000) {
    const movesTillMate = floor((mateScore - abs(currentEval)) * 0.5);
    evalText = movesTillMate > 0 ? "M" + movesTillMate : "1-0";
  } else {
    evalText = abs(currentEval * 0.01).toFixed(1);
  }

  noStroke();
  rectMode(CORNER);
  fill(0);
  rect(boardSize, 0, evalBarThickness, height);
  fill(255);
  rect(boardSize, height, evalBarThickness, map(currentEval, -bestEvaluation, bestEvaluation, 0, -height));

  textSize(10);
  textAlign(CENTER);
  if (currentEval >= 0) {
    fill(0);
    text(evalText, boardSize + evalBarThickness * 0.5, height - 20);
  } else {
    fill(255);
    text(evalText, boardSize + evalBarThickness * 0.5, 20);
  }
}

export function playSound(type) {
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
export function playMoveSound(move) {
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

//Adjust file and rank when the board is rotated visually
function adjustFile(file) {
  return flipBoard ? 7 - file : file;
}

function adjustRank(rank) {
  return flipBoard ? 7 - rank : rank;
}

function setShadow() {
  //Access the canvas 2D context
  drawingContext.shadowOffsetX = 5;
  drawingContext.shadowOffsetY = 5;
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = "rgba(0, 0, 0, 0.3)";
}

function setGlow() {
  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = 0;
  drawingContext.shadowBlur = 30; //Bigger value = more diffuse glow
  drawingContext.shadowColor = "rgba(255, 255, 255, 0.2)";
}

//Removes shadows and glows
function unsetEffects() {
  drawingContext.shadowBlur = 0;
  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = 0;
  drawingContext.shadowColor = 0;
}

export function updateMoveList(move) {
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

/*Debug functions*/

function debugView(engine) {
  const board = engine.board;
  const moveGenerator = engine.moveGenerator;

  if (engine.result != GameResult.starting) {
    //drawBB(moveGenerator.enemyAttacksMask, color(255,0,0,180));
    //drawBB(moveGenerator.pinRaysMask, color(255,0,255,180));
    //drawBB(moveGenerator.checkRaysMask, color(255,0,255,180));
    drawBB(moveGenerator.enemyPawnAttacksMask, color(255, 0, 255, 180));
  }

  drawBB(board.white.pawns, color(255, 0, 0, 180), color(255));
  drawBB(board.white.knights, color(245, 135, 0, 180), color(255));
  drawBB(board.white.bishops, color(245, 245, 0, 180), color(255));
  drawBB(board.white.rooks, color(70, 245, 0, 180), color(255));
  drawBB(board.white.queens, color(0, 245, 245, 180), color(255));
  drawBB(board.white.king, color(245, 0, 245, 180), color(255));

  drawBB(board.black.pawns, color(255, 0, 0, 180), color(0));
  drawBB(board.black.knights, color(245, 135, 0, 180), color(0));
  drawBB(board.black.bishops, color(245, 245, 0, 180), color(0));
  drawBB(board.black.rooks, color(70, 245, 0, 180), color(0));
  drawBB(board.black.queens, color(0, 245, 245, 180), color(0));
  drawBB(board.black.king, color(245, 0, 245, 180), color(0));
  printDebugText();
}

function printDebugText() {
  textAlign(CENTER, CENTER);
  textSize(14);
  noStroke();
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const pos = createVector(squareSize * i, squareSize * j);
      fill(255, 0, 255);
      text(8 * j + i, pos.x + 10, pos.y + 55);
      fill(0, 190, 255);
      text(i + "," + j, pos.x + 48, pos.y + 55);
      const sqr = BoardUtil.indexToSquare(i, j);
      fill(255, 190, 0);
      text(BoardUtil.sqrToString(sqr), pos.x + 48, pos.y + 15);
    }
  }
}

function drawBB(BB, clr = color(0), strokeClr = color(150)) {
  if (strokeClr != undefined) {
    stroke(strokeClr);
    strokeWeight(4);
  }
  fill(clr);
  while (BB != 0n) {
    const sqr = BBUtil.getLSBIndex(BB);
    const file = BoardUtil.squareToFile(sqr);
    const rank = BoardUtil.squareToRank(sqr);
    ellipse(file * squareSize + squareSize / 2, rank * squareSize + squareSize / 2, squareSize * 0.4);
    BB &= BB - 1n;
  }
}
