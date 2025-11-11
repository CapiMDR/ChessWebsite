/*
 * Handles all communication with the web worker script for the bot (CapraStar)
 */

export class BotController {
  constructor() {
    this.capraStar = new Worker("../Bot/CapraStar.js", { type: "module" });
  }

  initializeBot() {
    this.capraStar.postMessage({ type: "init" });
    this.capraStar.onmessage = (e) => {
      switch (e.data.type) {
        case "result":
          botEvents.dispatchEvent(new CustomEvent("botMove", { detail: e.data.bestMove }));
          botEvents.dispatchEvent(new CustomEvent("botEvaluation", { detail: e.data }));
          break;
        case "evaluation":
          e.data.evaluation *= -1; //Multiply evaluation by -1 for standard visualization (negative when black is winning)
          botEvents.dispatchEvent(new CustomEvent("botEvaluation", { detail: e.data }));
          break;
        default:
          console.log("Worker log: " + e.data);
      }
    };

    this.capraStar.onerror = (err) => {
      console.error("Worker error:", err.message, err);
    };

    this.capraStar.onmessageerror = (err) => {
      console.error("Worker message error:", err);
    };
  }

  //Does a bot search. "search" plays the result on the board, "evaluate" just draws arrows on the board
  startBotSearch(board, type) {
    this.capraStar.postMessage({
      type: type,
      fen: board.toFEN(true, true),
      repetitionHistory: board.repetitionHistory,
    });
  }
}

export const botEvents = new EventTarget();
export const botController = new BotController();
