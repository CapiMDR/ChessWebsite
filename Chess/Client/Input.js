/*All user input methods*/
let selectedSquare;
let selectToggle=true;
let dragging=false;

function touchStarted(){
  if(chess.result==GameResult.starting) return;
  
  const currentFile=Math.floor(mouseX/squareSize);
  const currentRank=Math.floor(mouseY/squareSize);
  const currentSquare=BoardUtil.indexToSquare(currentFile,currentRank);
  
  if(promotionMenu.active){
    const playedMove=handlePromotionClick(currentFile, currentRank);
    if(playedMove!=undefined) chess.playMove(playedMove, false, true);
    return;
  }
  
  if(BoardUtil.outOfBounds(currentFile,currentRank)){
    selectedSquare=undefined;
    return;
  }
  
  if(selectedSquare!=undefined){ 
    const playedMove=searchMoves(selectedSquare, currentSquare);
    if(playedMove!=undefined){
      chess.playMove(playedMove, false, true);
      selectedSquare=undefined;
      return;
    }
  }
  
  selectToggle=!selectToggle;
  if(selectedSquare!=currentSquare) selectToggle=false;
  selectedSquare=currentSquare;
}

function touchMoved() {
  dragging=true;
}

function touchEnded() {
  dragging=false
  if(selectedSquare==undefined) return;
  const releasedFile=Math.floor(mouseX/squareSize);
  const releasedRank=Math.floor(mouseY/squareSize);
  
  releasedSquare=BoardUtil.indexToSquare(releasedFile,releasedRank);
  if(BoardUtil.outOfBounds(releasedFile, releasedRank)) return;
  
  //If the promotion UI is active, don't get a new move
  if(promotionMenu.active) return;
  
  const playedMove=searchMoves(selectedSquare, releasedSquare);
  if(playedMove!=undefined) chess.playMove(playedMove, false, true);
  
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
    lastBestMove=undefined;
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

function keyPressed() {
  //Skip inputs if selecting a text field
  const active = document.activeElement;
  if(active.tagName=="INPUT" || active.tagName=="TEXTAREA") return;
  
  //Start the game
  if (key === ' ') {
    const whiteBotCheckBox=document.getElementById("whiteBotBox");
    const blackBotCheckBox=document.getElementById("blackBotBox");
    
    if(whiteBotCheckBox.checked) chess.bots[white]=capraStar;
    if(blackBotCheckBox.checked) chess.bots[black]=capraStar;
    
    document.getElementById('overlay').style.display = 'none';
    chess.startGame();
  }
  
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
  
  //Fetch current position's FEN
  if (key === 'e') {
    FENTextField=document.getElementById("textTXT");
    FENTextField.value=chess.board.toFEN(true, true);
  }
  
  //Get move history
  if (key === 'q') {
    let moveHistoryString="";
    for(let i=0;i<chess.moveHistory.length;i+=2){
      moveHistoryString+=(floor(i*0.5)+1) + "-" + Move.toString(chess.moveHistory[i]) + " ";
      if(i+1<chess.moveHistory.length)
      moveHistoryString+=Move.toString(chess.moveHistory[i+1]) + "\n";
    }
    console.log(moveHistoryString);
  }
  
  
  /*Debug keybinds*/
  
  if (keyCode === UP_ARROW) {
    const captures=chess.moveGenerator.generateMoves(chess.board,true);
    for(let capture of captures){
      Move.toString(capture);
    }
  }
  
  if (keyCode === DOWN_ARROW) {
    console.log(chess.moveGenerator.inCheck);
    console.log("All pieces");
    BBUtil.printBB(chess.board.piecesBB);
    console.log("Black pieces");
    BBUtil.printBB(chess.board.black.pieces);
    console.log("White pieces");
    BBUtil.printBB(chess.board.white.pieces);
    console.log(chess.board.toString());
    console.log("White pawns");
    BBUtil.printBB(chess.board.white.pawns);
    console.log("Black pawns");
    BBUtil.printBB(chess.board.black.pawns);
  }
  
  if (keyCode === LEFT_ARROW) {
    const board=chess.board;
    let phase=0;
    const phaseValues = [0,0,1,1,2,4,0];
    const totalPhase=24;
    phase+=phaseValues[pawn]*(board.pieceCounts[white][pawn]+board.pieceCounts[black][pawn]);
    phase+=phaseValues[knight]*(board.pieceCounts[white][knight]+board.pieceCounts[black][knight]);
    phase+=phaseValues[bishop]*(board.pieceCounts[white][bishop]+board.pieceCounts[black][bishop]);
    phase+=phaseValues[rook]*(board.pieceCounts[white][rook]+board.pieceCounts[black][rook]);
    phase+=phaseValues[queen]*(board.pieceCounts[white][queen]+board.pieceCounts[black][queen]);
    //Clamping phase in case of weird positions
    if (phase<0) phase=0;
    if (phase>totalPhase) phase=totalPhase;
    console.log(totalPhase-phase);
  }
  
  if (keyCode === RIGHT_ARROW) {
    const blackPawns=chess.board.black.pawns;
    console.log((BBUtil.passedPawnMasks[white][33] & blackPawns)==0);
    console.log((BBUtil.passedPawnMasks[white][36] & blackPawns)==0);
    console.log((BBUtil.passedPawnMasks[white][38] & blackPawns)==0);
    
    const whitePawns=chess.board.white.pawns;
    console.log((BBUtil.passedPawnMasks[black][9] & whitePawns)==0);
    console.log((BBUtil.passedPawnMasks[black][11] & whitePawns)==0);
    console.log((BBUtil.passedPawnMasks[black][39] & whitePawns)==0);
    
    const squaresToEdgeWhite=BoardUtil.squareToRank(4);
    console.log(squaresToEdgeWhite);
    
    const squaresToEdgeBlack=7-BoardUtil.squareToRank(4);
    console.log(squaresToEdgeBlack);
  }
  
  if (key === 'i') {
    console.log("Got:");
    console.log(chess.board.zobristKey.toString());
    console.log("Expected:");
    console.log(Zobrist.computeZobristHash(chess.board).toString());
  }
  
  if (key === 'p') {
    const board=chess.board;
    const start = performance.now();
    const engineResults=perftDivide(board, 4);
    const end = performance.now();
    
    const stockFishMap=mapResults(stockfishResults);
    compareOutputs(engineResults,stockFishMap);
    console.log(`Execution time: ${end - start} ms`);
  }
  
  if (key === 'o') {
    const movesString = "1-d2d4 g8f6 2-c1f4 b8c6 3-e2e3 f6d5 4-f4g3 e7e6 5-b1d2 d5f6 6-g1f3 d7d5 7-f1b5 c8d7 8-e1g1 f8d6 9-g3d6 c7d6 10-d1e2 d8b6 11-a2a3 a7a6 12-b5c6 d7c6 13-e2d3 e8g8 14-a1b1 a8e8 15-d3c3 f6e4 16-c3d3 e6e5 17-h2h3 e4f6 18-d3b3 b6a5 19-b1d1 e5e4 20-f3h4 c6a4 21-b3b7 a4c2 22-h4f5 c2d1 23-f1d1 e8b8 24-b7c6 b8b2 25-f5e7 g8h8 26-c6d6 b2d2 27-d1d2 a5d2 28-e7d5 d2d1 29-g1h2 f8a8 30-d5f6 g7f6 31-d6f6 h8g8 32-f6g5 g8f8 33-g5c5 f8g7 34-c5g5 g7h8 35-g5f6 h8g8 36-f6g5 g8f8 37-g5c5 f8g8 38-c5g5";
    const movePattern = /\b[a-h][1-8][a-h][1-8][qrbn]?\b/g;
    const moveArray=movesString.match(movePattern) || []
    chess.board.init();
    chess.board.fillBoard(startFEN);
    for(let UCImove of moveArray){
      console.log(UCImove);
      const move=Move.UCIToMove(UCImove, chess.board);
      chess.playMove(move);
    }
  }
}