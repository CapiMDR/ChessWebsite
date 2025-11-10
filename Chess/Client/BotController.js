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
      setBotEvaluation(e.data.bestMove, e.data.evaluation, e.data.pv);
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

//Does a bot search. "search" plays the result on the board, "evaluate" just draws arrows on the board
export function startBotSearch(board, type) {
  console.log(type);
  capraStar.postMessage({
    type: type,
    fen: board.toFEN(true, true),
    repetitionHistory: board.repetitionHistory,
  });
}
