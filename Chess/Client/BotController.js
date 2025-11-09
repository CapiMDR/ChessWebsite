//Handles all communication with the web worker script for the bot (CapraStar)
import { playMoveLocally, setBotEvaluation } from "./ClientController.js";
const capraStar = new Worker("../Bot/CapraStar.js", { type: "module" });

export function initializeBot() {
  capraStar.postMessage({ type: "init" });
}

capraStar.onmessage = function (e) {
  switch (e.data.type) {
    case "result":
      setBotEvaluation(null, e.data.evaluation);
      playMoveLocally(e.data.bestMove);
      break;
    case "evaluation":
      setBotEvaluation(e.data.bestMove, e.data.evaluation);
      //console.log("Best Move: " + Move.toString(e.data.bestMove));
      //console.log("Evaluation: " + (lastEval * 0.01).toFixed(1));
      // let pvString = "";
      // for (let move of e.data.pv) {
      //   pvString += Move.toString(move) + " ";
      // }
      //console.log("Principal variation: " + pvString);
      //console.log("Time taken: " + e.data.timeTaken + " ms");
      break;
    default:
      console.log("Worker log: " + e.data);
  }
};

capraStar.onerror = (err) => {
  console.error("Worker error:", err.message, err);
};

capraStar.onmessageerror = (err) => {
  console.error("Worker message error:", err);
};

//Does a bot search and plays the best move on the board
export function startBotSearch(board) {
  capraStar.postMessage({
    type: "search",
    fen: board.toFEN(true, true),
    repetitionHistory: board.repetitionHistory,
  });
}

//Does a bot search without playing the move on the board
export function startBotEvaluation(board) {
  capraStar.postMessage({
    type: "evaluate",
    fen: board.toFEN(true, true),
    repetitionHistory: board.repetitionHistory,
  });
}
