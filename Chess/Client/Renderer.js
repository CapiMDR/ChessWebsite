//Handles canvas (board, timers, etc) drawing and sounds
import { BBUtil } from '../Shared/BBUtil.js';
import { Piece } from '../Shared/Piece.js';
import { Move } from '../Shared/Move.js';
import { BoardUtil } from '../Shared/BoardUtil.js';
import{  white, black, none, pawn, knight, bishop, rook, queen, king, enPassantFlag, castleFlag } from '../Shared/Constants.js';
import { selectedSquare, dragging} from './Input.js';
import { GameResult } from '../Shared/Engine.js';
import { engine, setupGame, clientColor } from './ClientGame.js';
import { engine, setupGame } from './ClientGame.js';
import { sendToServer, host, port } from './ClientNetwork.js';

const windowHeight = window.innerHeight;
const boardSize=windowHeight*0.9*0.8;
const evalBarThickness=windowHeight*0.03;
const UISize=windowHeight*0.6*0.8;
export const squareSize=boardSize/8;
const UICenter=boardSize+(UISize+evalBarThickness)*0.5;


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

let capture_Sound;
let move_Sound;
let check_Sound;
export let gameOver_Sound;
export let start_Sound;
let castle_Sound;

window.preload = function() {
  const baseURL = `https://${host}:${port}/assets`;
  const imageUrl = `${baseURL}/Images`
  const soundUrl = `${baseURL}/Sounds`

  wP_Icon=loadImage(`${imageUrl}/WP.png`);
  wN_Icon=loadImage(`${imageUrl}/WN.png`);
  wB_Icon=loadImage(`${imageUrl}/WB.png`);
  wR_Icon=loadImage(`${imageUrl}/WR.png`);
  wQ_Icon=loadImage(`${imageUrl}/WQ.png`);
  wK_Icon=loadImage(`${imageUrl}/WK.png`);


  bP_Icon=loadImage(`${imageUrl}/BP.png`);
  bN_Icon=loadImage(`${imageUrl}/BN.png`);
  bB_Icon=loadImage(`${imageUrl}/BB.png`);
  bR_Icon=loadImage(`${imageUrl}/BR.png`);
  bQ_Icon=loadImage(`${imageUrl}/BQ.png`);
  bK_Icon=loadImage(`${imageUrl}/BK.png`);
  
  capture_Sound=loadSound(`${soundUrl}/captures.mp3`);
  move_Sound=loadSound(`${soundUrl}/move.mp3`);
  check_Sound=loadSound(`${soundUrl}/check.mp3`);
  gameOver_Sound=loadSound(`${soundUrl}/gameOver.mp3`);
  castle_Sound=loadSound(`${soundUrl}/castle.mp3`);
  start_Sound=loadSound(`${soundUrl}/start.mp3`);
  
  check_Glow=loadImage(`${imageUrl}/Glow.png`);
}

window.setup = function() {
  const cnv = createCanvas(boardSize+UISize, boardSize);
  cnv.parent("canvasContainer");
  setupGame();
  //Telling the server that this client is ready to begin
  sendToServer({type: 'ready'});
}

function redoMove() {
  engine.redoMove();
}

function undoMove() {
  engine.undoMove();
}

export function setupBoard(FEN) {
  engine.board.init();
  engine.board.fillBoard(FEN.trim());
}

window.draw = function() {
  //background(251,251,251);
  background(245);
  drawBoard();
  highlightSquares(engine, color(45,221,162,180), color(211,42,50,180));
  drawCheckBubble(engine);
  drawPieces(engine);
  
  //debugView(engine);

  if(clientColor==engine.clrToMove) drawLegalMoves(engine, color(45,221,162,180));
  drawBestMoveArrow();
  drawUIText(engine);
  drawUITimers(engine);
  drawCapturedPieces(engine);
  if(promotionMenu.active) drawPromotionUI(engine);
  drawBotEval(engine);
  drawDraggedPiece(engine);
  
  //Undo last move - rewind (z key)
  if (keyIsDown(90)) {
    engine.undoMove();
  }
  
  //Redo last undone move - fastforward (x key)
  if (keyIsDown(88)) {
    engine.redoMove();
  }
}

function drawBoard() {
  noStroke();
  rectMode(CORNER);
  textSize(16);
  textAlign(CENTER);
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      //Squares
      const isLightSquare=BoardUtil.isLightSquare(f,r);
      fill(isLightSquare ? 240 : 100);
      rect(f * squareSize, r * squareSize, squareSize, squareSize);
      
      //Text
      fill(isLightSquare ? 100 : 240);
      if(f==0) text(8-r,10, squareSize*r+squareSize*0.25);
      if(r==7) text(String.fromCharCode(97 + f),squareSize*f+squareSize*0.82, height-10);
    }
  }
}

function drawPieces(engine){
  const board=engine.board;
  imageMode(CENTER);
  let allPieces = board.piecesBB;
  while(allPieces != 0n){
    const sqr = BBUtil.getLSBIndex(allPieces);
    allPieces &= allPieces - 1n;
    //Skip if drawing dragged piece (handled later)
    if(dragging && sqr==selectedSquare) continue;
    const file = BoardUtil.squareToFile(sqr);
    const rank = BoardUtil.squareToRank(sqr);
    const piece = board.piecesList[sqr];
    const img=getImageFromPiece(piece);
    
    const drawFile=file*squareSize+squareSize/2;
    const drawRank=rank*squareSize+squareSize/2;
    
    image(img,drawFile,drawRank,squareSize,squareSize);
  }
}

function drawDraggedPiece(engine){
  if(selectedSquare==undefined) return;
  if(!dragging) return;
  if(!BBUtil.isBitSet(selectedSquare,engine.board.piecesBB)) return;
  const piece = engine.board.piecesList[selectedSquare];
  let img=getImageFromPiece(piece);
    
  image(img,mouseX,mouseY,squareSize*1.2,squareSize*1.2);
}

function drawCapturedPieces(engine){
  const valueDifference=engine.whiteMaterial-engine.blackMaterial;
  const drawSize=squareSize*0.5;
  const drawLocation=boardSize+50;
  const spacing=12;
  
  let whiteOffset=0;
  let blackOffset=0;
  
  for(let piece of Piece.indeces){
    const capturedAmount = engine.capturedPieceCounts[piece];
    let img=getImageFromPiece(piece);
    for(let i=0;i<capturedAmount;i++){ 
      if(Piece.clr(piece)==white){
        image(img,drawLocation+whiteOffset,50,drawSize,drawSize);
        whiteOffset+=spacing;
      }else{
        image(img,drawLocation+blackOffset,height-50,drawSize,drawSize);
        blackOffset+=spacing;
      }
    }
  }
  
  fill(0);
  textSize(12);
  textAlign(CENTER);
  if(valueDifference<0){
    text("+" + abs(valueDifference),drawLocation+whiteOffset+20, 50);
  }else if(valueDifference>0){
    text("+" + valueDifference,drawLocation+blackOffset+20, height-50);
  }
}

function drawLegalMoves(engine,clr=color(0)){
  fill(clr);
  noStroke();
  for(let move of engine.moves){
    const startSquare=Move.startSqr(move);
    const targetSquare=Move.targetSqr(move);
    if(startSquare!=selectedSquare) continue;
    
    const file=BoardUtil.squareToFile(targetSquare);
    const rank=BoardUtil.squareToRank(targetSquare);
    ellipse(
      file * squareSize + squareSize / 2,
      rank * squareSize + squareSize / 2,
      squareSize * 0.4
    );
  }
}

function getImageFromPiece(piece){
  const pieceType=Piece.type(piece);
  const pieceColor=Piece.clr(piece);
  let img;
  switch(pieceType){
    case pawn: img=(pieceColor == white) ? wP_Icon : bP_Icon; 
    break;
    case knight: img=(pieceColor == white) ? wN_Icon : bN_Icon;  
    break;
    case bishop: img=(pieceColor == white) ? wB_Icon : bB_Icon;  
    break;
    case rook: img=(pieceColor == white) ? wR_Icon : bR_Icon; 
    break;
    case queen: img=(pieceColor == white) ? wQ_Icon : bQ_Icon; 
    break;
    case king: img=(pieceColor == white) ? wK_Icon : bK_Icon; 
    break;
  }
  return img;
}

function highlightSquares(engine, selectedClr=color(0), moveClr=color(0)){
  noStroke();
  //Highlighting selected piece original square
  if(selectedSquare!=undefined){
    fill(selectedClr);
    const selectedFile=BoardUtil.squareToFile(selectedSquare);
    const selectedRank=BoardUtil.squareToRank(selectedSquare);
    rect(selectedFile * squareSize, selectedRank * squareSize, squareSize, squareSize); 
  }
  
  //Highlighting last move's start and target squares
  if(engine.moveHistory.length==0) return;
  const lastMove=engine.moveHistory[engine.moveHistory.length-1];
  const startSquare=Move.startSqr(lastMove);
  const startFile=BoardUtil.squareToFile(startSquare);
  const startRank=BoardUtil.squareToRank(startSquare);
  
  const targetSquare=Move.targetSqr(lastMove);
  const targetFile=BoardUtil.squareToFile(targetSquare);
  const targetRank=BoardUtil.squareToRank(targetSquare);
  fill(moveClr);
  rect(startFile * squareSize, startRank * squareSize, squareSize, squareSize);
  rect(targetFile * squareSize, targetRank * squareSize, squareSize, squareSize);
}

function drawCheckBubble(engine){
  if(!engine.moveGenerator.inCheck) return;
  imageMode(CENTER);
  const kingBB = (engine.clrToMove==white) ? engine.board.white.king : engine.board.black.king;
  const kingSqr = BBUtil.getLSBIndex(kingBB);
  const kingFile=BoardUtil.squareToFile(kingSqr);
  const kingRank=BoardUtil.squareToRank(kingSqr);
  tint(255,0,0);
  const drawFile=kingFile*squareSize+squareSize*0.5;
  const drawRank=kingRank*squareSize+squareSize*0.5;
  image(check_Glow,drawFile,drawRank,squareSize*2,squareSize*2);
  noTint();
}

function drawUIText(engine){
  fill(0);
  noStroke();
  textSize(16);
  textAlign(CENTER);
  if(engine.result==GameResult.inProgress){
    text((engine.clrToMove==white) ? "White to move" : "Black to move", UICenter, height/2);
  }else{
    text(engine.result, UICenter, height/2);
  } 
}

function drawUITimers(engine){
  textAlign(CENTER,CENTER); 
  rectMode(CENTER);
  let opacity=(engine.clrToMove==white) ? 255 : 100;
  const timerWidth=UISize*0.3;
  const timerHeight=UISize*0.15;
  
  if(engine.timers[white]!=undefined){
    fill(255,opacity); 
    rect(UICenter,3*height/4,timerWidth,timerHeight,5);
    fill(0,opacity);
    text(engine.timers[white].getTime(),UICenter,3*height/4);
  }
  
  opacity=(engine.clrToMove==black) ? 255 : 100;
  
  if(engine.timers[black]!=undefined){
    fill(0,opacity);
    rect(UICenter,height/4,timerWidth,timerHeight,5);
    fill(255,opacity);
    text(engine.timers[black].getTime(),UICenter,height/4);
  }
}

export let promotionMenu = {
  active: false,
  x: 0,
  y: 0,
  move: null,
  options: [5, 4, 3, 2]
};

function drawPromotionUI(engine) {
  fill(255);
  stroke(0);
  strokeWeight(2);
  rectMode(CORNER);
  imageMode(CENTER);
  const {x, y, options} = promotionMenu;
  for(let i = 0; i < options.length; i++) {
    rect(x, y + i * squareSize, squareSize, squareSize);
    let img=getImageFromPiece(Piece.newPiece(options[i],engine.clrToMove));
    const drawFile=x + squareSize/2;
    const drawRank= y + i * squareSize + squareSize/2
    image(img,drawFile,drawRank,squareSize,squareSize);
  }
}

let currentEval=0;
let lastEval=0;

//Draws CapraStar's evaluation if active
function drawBotEval(engine){
  const bestEvaluation=2000; //How "great" should the evaluation be to cover the entire bar
  const mateScore=10000000; //The highest score a bot can give to a move (mate next move)

  //If it's a mate score, skip interpolation so the bar jumps instantly
  if (Math.abs(lastEval)>mateScore-1000) {
    currentEval=lastEval;
  } else {
    currentEval=lerp(currentEval, lastEval, 0.1);
  }

  let evalText;
  if (Math.abs(currentEval)>mateScore-1000) {
    const movesTillMate = floor((mateScore - abs(currentEval)) * 0.5);
    evalText = (movesTillMate > 0) ? "M" + movesTillMate : "1-0";
  } else {
    evalText = abs((currentEval * 0.01)).toFixed(1);
  }
  
  noStroke();
  rectMode(CORNER);
  fill(0);
  rect(boardSize, 0, evalBarThickness, height);
  fill(255);
  rect(boardSize, height, evalBarThickness, map(currentEval, -bestEvaluation, bestEvaluation, 0, -height));

  textSize(10);
  textAlign(CENTER);
  if(currentEval>=0){
    fill(0);
    text(evalText, boardSize + evalBarThickness * 0.5, height - 20);
  } else {
    fill(255);
    text(evalText, boardSize + evalBarThickness * 0.5, 20);
  }
}

//Draws arrow between two squares
function drawArrow(fromSq, toSq, clr=color(0)) {
  //Convert square index into x,y coordinates (center of square)
  let fromFile = BoardUtil.squareToFile(fromSq);
  let fromRank = BoardUtil.squareToRank(fromSq);
  let toFile = BoardUtil.squareToFile(toSq);
  let toRank = BoardUtil.squareToRank(toSq);

  let x1 = fromFile * squareSize + squareSize / 2;
  let y1 = fromRank * squareSize + squareSize / 2; // flip rank for drawing
  let x2 = toFile * squareSize + squareSize / 2;
  let y2 = toRank * squareSize + squareSize / 2;

  //Draw line
  stroke(clr);
  strokeWeight(8);
  line(x1, y1, x2, y2);
  
  //Draw arrowhead
  let angle = atan2(y1 - y2, x1 - x2);
  push();
  translate(x2, y2);
  rotate(angle - HALF_PI);
  noStroke();
  fill(clr);
  triangle(-20, 20, 20, 20, 0, -10); // arrowhead size
  pop();
}

export let lastBestMove=null;

//Draws an arrow for the recommended move by CapraStar
function drawBestMoveArrow(){
  if(lastBestMove==null) return;
  const startSquare=Move.startSqr(lastBestMove);
  const targetSquare=Move.targetSqr(lastBestMove);
  drawArrow(startSquare,targetSquare, color(76,217,228));
}

export function playSound(type){
  switch(type){
    case "Start": start_Sound.play();
    break;
    case "End": gameOver_Sound.play();
    break;
    case "Check": check_Sound.play();
    break; 
  }
}

//Notes: Move must not have been played already to play the right sound. This function does not play check sounds
export function playMoveSound(move){
  const flag=Move.flag(move);
  const targetSquare=Move.targetSqr(move);
  const capturedPiece=engine.board.piecesList[targetSquare];
  const capturedPieceType=Piece.type(capturedPiece);
    
  if(flag==castleFlag){
    castle_Sound.play();
    return;
  }
  
  if(capturedPieceType!=none || flag==enPassantFlag){
    capture_Sound.play();
    return;
  }
  
  move_Sound.play();
}

export function updateMoveList(move){
  //Update moves list UI
  const movesList = document.getElementById("movesList");
  const moveListItems = movesList.getElementsByTagName('li');
  const moveString = Move.toString(move);
  if(engine.moveHistory.length%2==1){
    const moveListItem = document.createElement("li");
    movesList.appendChild(moveListItem);
  }
  moveListItems[moveListItems.length-1].textContent+=" " + moveString + " ";
}

/*Debug functions*/

function debugView(engine){
  const board=engine.board;
  const moveGenerator=engine.moveGenerator;
  
  if(engine.result!=GameResult.starting){
    //drawBB(moveGenerator.enemyAttacksMask, color(255,0,0,180));
    //drawBB(moveGenerator.pinRaysMask, color(255,0,255,180));
    //drawBB(moveGenerator.checkRaysMask, color(255,0,255,180));
    drawBB(moveGenerator.enemyPawnAttacksMask, color(255,0,255,180));
  }
  
  drawBB(board.white.pawns, color(255,0,0,180), color(255));
  drawBB(board.white.knights, color(245,135,0,180), color(255));
  drawBB(board.white.bishops, color(245,245,0,180), color(255));
  drawBB(board.white.rooks, color(70,245,0,180), color(255));
  drawBB(board.white.queens, color(0,245,245,180), color(255));
  drawBB(board.white.king, color(245,0,245,180), color(255));
  
  drawBB(board.black.pawns, color(255,0,0,180), color(0));
  drawBB(board.black.knights, color(245,135,0,180), color(0));
  drawBB(board.black.bishops, color(245,245,0,180), color(0));
  drawBB(board.black.rooks, color(70,245,0,180), color(0));
  drawBB(board.black.queens, color(0,245,245,180), color(0));
  drawBB(board.black.king, color(245,0,245,180), color(0));
  printDebugText();
}

function printDebugText(){
  textAlign(CENTER,CENTER); 
  textSize(14);
  noStroke();
  for(let i=0;i<8;i++){
    for(let j=0;j<8;j++){
      pos=createVector(squareSize*i,squareSize*j); 
      fill(255,0,255);
      text(8*j+i, pos.x+10, pos.y+55);
      fill(0,190,255);
      text(i + "," + j, pos.x+48, pos.y+55);
      const sqr=BoardUtil.indexToSquare(i,j);
      fill(255,190,0);
      text(BoardUtil.sqrToString(sqr), pos.x+48, pos.y+15);
    }
  }
}

function drawBB(BB, clr=color(0), strokeClr=color(150)) {
  if(strokeClr != undefined){
    stroke(strokeClr);
    strokeWeight(4);
  }
  fill(clr);
  while (BB != 0n) {
    const sqr = BBUtil.getLSBIndex(BB);
    const file=BoardUtil.squareToFile(sqr);
    const rank=BoardUtil.squareToRank(sqr);
    ellipse(file * squareSize + squareSize / 2, rank * squareSize + squareSize / 2, squareSize * 0.4);
    BB &= BB - 1n;
  }
}