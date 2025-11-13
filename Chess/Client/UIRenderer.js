/**
 * Handles UI canvas (timers, player names, captured pieces, etc)
 */
import { Piece } from "../Shared/Piece.js";
import { white, black, pawn, knight, bishop, rook, queen, king } from "../Shared/Constants.js";
import { GameResult } from "../Shared/Engine.js";
import { flipBoard } from "./ClientController.js";
import { engine } from "./GameController.js";
import { networkEvents } from "./ClientNetwork.js";

// ====== Sizing Constants ======
const windowHeight = window.innerHeight;
const UIHorizontalSize = windowHeight * 0.6 * 0.8;
const UIVerticalSize = windowHeight * 0.9 * 0.8;
const squareSize = UIVerticalSize / 8;
const UIXCenter = UIHorizontalSize * 0.5;
const UIYCenter = UIVerticalSize * 0.5;

// ====== Piece Images ======
let wP_Icon, wN_Icon, wB_Icon, wR_Icon, wQ_Icon, wK_Icon;
let bP_Icon, bN_Icon, bB_Icon, bR_Icon, bQ_Icon, bK_Icon;

// ====== Player Data ======
let playerNames = {
  white: null,
  black: null,
};

// Listen for network events
networkEvents.addEventListener("startGame", (e) => {
  playerNames.white = e.detail.players.white.username;
  playerNames.black = e.detail.players.black.username;
});

// ====== Exported p5 Instance ======
export const UISketch = (p) => {
  // --- Preload ---
  p.preload = () => {
    const piecesUrl = `../../Assets/Images/merida`;

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
  };

  // --- Setup ---
  p.setup = () => {
    const cnv = p.createCanvas(UIHorizontalSize, UIVerticalSize);
    cnv.parent("UIContainer");
  };

  // --- Draw Loop ---
  p.draw = () => {
    p.background(56);
    drawUI(p);
  };
};

// ====== UI Drawing Functions ======

function drawUI(p) {
  setShadow(p);
  p.rectMode(p.CENTER);
  p.fill(75);
  p.rect(UIXCenter, UIYCenter, UIHorizontalSize * 0.85, UIVerticalSize * 0.85);
  unsetEffects(p);

  drawUIText(p, engine);
  drawUITimers(p, engine);
  drawCapturedPieces(p, engine);
}

function drawUIText(p, engine) {
  p.fill(255);
  p.noStroke();
  p.textSize(16);
  p.textAlign(p.CENTER);

  // Game status
  if (engine.result === GameResult.inProgress) {
    p.text(engine.clrToMove === white ? "White to move" : "Black to move", UIXCenter, p.height / 2);
  } else {
    p.text(engine.result, UIXCenter, p.height / 2);
  }

  // Player names
  const nameOffset = 75;
  const whiteY = flipBoard ? p.height / 4 - nameOffset : (3 * p.height) / 4 + nameOffset;
  const blackY = flipBoard ? (3 * p.height) / 4 + nameOffset : p.height / 4 - nameOffset;

  if (playerNames.white) p.text(playerNames.white, UIXCenter, whiteY);
  if (playerNames.black) p.text(playerNames.black, UIXCenter, blackY);
}

function drawUITimers(p, engine) {
  p.textAlign(p.CENTER, p.CENTER);
  p.rectMode(p.CENTER);

  const timerWidth = UIHorizontalSize * 0.3;
  const timerHeight = UIHorizontalSize * 0.15;

  const whiteY = flipBoard ? p.height / 4 : (3 * p.height) / 4;
  const blackY = flipBoard ? (3 * p.height) / 4 : p.height / 4;

  // --- White Timer ---
  let opacity = engine.clrToMove === white ? 255 : 100;
  if (engine.timers[white]) {
    p.fill(255, opacity);
    if (engine.clrToMove === white) setGlow(p);
    p.rect(UIXCenter, whiteY, timerWidth, timerHeight, 5);
    unsetEffects(p);
    p.fill(0, opacity);
    p.text(engine.timers[white].getTime(), UIXCenter, whiteY);
  }

  // --- Black Timer ---
  opacity = engine.clrToMove === black ? 255 : 100;
  if (engine.timers[black]) {
    p.fill(0, opacity);
    if (engine.clrToMove === black) setGlow(p);
    p.rect(UIXCenter, blackY, timerWidth, timerHeight, 5);
    unsetEffects(p);
    p.fill(255, opacity);
    p.text(engine.timers[black].getTime(), UIXCenter, blackY);
  }
}

function drawCapturedPieces(p, engine) {
  const valueDifference = engine.whiteMaterial - engine.blackMaterial;
  const drawSize = squareSize * 0.5;
  const horizontalDrawStart = UIHorizontalSize * 0.15;
  const spacing = 12;

  let whiteOffset = 0;
  let blackOffset = 0;
  const whiteDrawY = flipBoard ? UIVerticalSize * 0.96 : UIVerticalSize * 0.04;
  const blackDrawY = flipBoard ? UIVerticalSize * 0.04 : UIVerticalSize * 0.96;

  p.imageMode(p.CENTER);
  for (let piece of Piece.indeces) {
    const capturedAmount = engine.capturedPieceCounts[piece];
    const img = getImageFromPiece(piece);
    for (let i = 0; i < capturedAmount; i++) {
      if (Piece.clr(piece) === white) {
        p.image(img, horizontalDrawStart + whiteOffset, whiteDrawY, drawSize, drawSize);
        whiteOffset += spacing;
      } else {
        p.image(img, horizontalDrawStart + blackOffset, blackDrawY, drawSize, drawSize);
        blackOffset += spacing;
      }
    }
  }

  p.fill(255);
  p.textSize(12);
  p.textAlign(p.CENTER);
  if (valueDifference < 0) {
    p.text("+" + Math.abs(valueDifference), horizontalDrawStart + whiteOffset + 20, whiteDrawY);
  } else if (valueDifference > 0) {
    p.text("+" + valueDifference, horizontalDrawStart + blackOffset + 20, blackDrawY);
  }
}

// ====== Helpers ======

function getImageFromPiece(piece) {
  const pieceType = Piece.type(piece);
  const pieceColor = Piece.clr(piece);
  switch (pieceType) {
    case pawn:
      return pieceColor === white ? wP_Icon : bP_Icon;
    case knight:
      return pieceColor === white ? wN_Icon : bN_Icon;
    case bishop:
      return pieceColor === white ? wB_Icon : bB_Icon;
    case rook:
      return pieceColor === white ? wR_Icon : bR_Icon;
    case queen:
      return pieceColor === white ? wQ_Icon : bQ_Icon;
    case king:
      return pieceColor === white ? wK_Icon : bK_Icon;
  }
}

function setShadow(p) {
  //Access the canvas 2D context
  p.drawingContext.shadowOffsetX = 5;
  p.drawingContext.shadowOffsetY = 5;
  p.drawingContext.shadowBlur = 15;
  p.drawingContext.shadowColor = "rgba(0, 0, 0, 0.3)";
}

function setGlow(p) {
  p.drawingContext.shadowOffsetX = 0;
  p.drawingContext.shadowOffsetY = 0;
  p.drawingContext.shadowBlur = 30;
  p.drawingContext.shadowColor = "rgba(255, 255, 255, 0.2)";
}

function unsetEffects(p) {
  p.drawingContext.shadowBlur = 0;
  p.drawingContext.shadowOffsetX = 0;
  p.drawingContext.shadowOffsetY = 0;
  p.drawingContext.shadowColor = 0;
}
