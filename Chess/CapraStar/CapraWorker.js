//Web worker script for the AI to run in parallel to the UI
import { Board } from "../Shared/Board.js";
import { CapraStar } from "./CapraCore.js";

let capraStar = null;
const bookPath = "./Book.txt";
let book = {};
let initPromise = null;

onmessage = async function (e) {
  const { type, fen, repetitionHistory, difficulty } = e.data;

  switch (type) {
    case "init":
      //Only create the promise once
      if (!initPromise) initPromise = initBot(difficulty);
      break;

    case "search":
      //Wait for initBot() before searching
      if (!initPromise) initPromise = initBot();
      await initPromise;

      const bestMove1 = search(fen, repetitionHistory);
      postMessage({
        type: "result",
        bestMove: bestMove1,
        evaluation: capraStar.evaluation,
      });
      break;

    case "evaluate":
      //Wait for initBot() before evaluating
      if (!initPromise) initPromise = initBot();
      await initPromise;

      const start = performance.now();
      const bestMove2 = search(fen, repetitionHistory);
      const end = performance.now();

      postMessage({
        type: "evaluation",
        bestMove: bestMove2,
        evaluation: capraStar.evaluation,
        pv: capraStar.principalVariation,
        timeTaken: end - start,
      });
      break;
  }
};

//Initialize bot with its opening book (async for fetching the txt file)
async function initBot(difficulty = "3") {
  capraStar = new CapraStar(new Board());
  book = await loadBookMoveEntries(bookPath);
  capraStar.openingBook = book;

  difficulty = Number(difficulty);
  capraStar.difficulty = difficulty;
}

function search(fen, repetitionHistory) {
  //Empty CapraStar's copy of the board
  capraStar.board.init();
  //Reconstruct current board from FEN
  capraStar.board.fillBoard(fen);
  capraStar.positionHistory = repetitionHistory;

  const moves = capraStar.moveGen.generateMoves(capraStar.board);
  //Get best move
  const bestMove = capraStar.getBestMove(moves);
  return bestMove;
}

//Initializes an opening repertoire for the bots to play
async function loadBookMoveEntries(filePath) {
  //Read the entire book file
  const response = await fetch(filePath);
  if (!response.ok) {
    console.error(`Failed to load book file: ${response.status} ${response.statusText}`);
    return {};
  }

  const plainText = await response.text();

  //Split into lines and clean up
  const lines = plainText
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const book = {};
  let currentFEN = null;

  for (const l of lines) {
    if (l.startsWith("pos ")) {
      currentFEN = l.substring(4).trim();
      if (!book[currentFEN]) {
        book[currentFEN] = [];
      }
    } else if (currentFEN) {
      //It's a move line, add it to the current FEN's move list
      book[currentFEN].push(l);
    }
  }
  return book;
}
