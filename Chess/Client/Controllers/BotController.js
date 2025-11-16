/*
 * Handles all communication with the web worker script for the bot (CapraStar)
 */

import { gameController } from "./GameController.js";

export class BotController {
  constructor() {
    this.capraStar = new Worker("../CapraStar/CapraWorker.js", { type: "module" });
  }

  initializeBot(difficulty) {
    this.capraStar.postMessage({ type: "init", difficulty: difficulty });
    this.capraStar.onmessage = (e) => {
      switch (e.data.type) {
        case "result":
          if (!gameController.gameInProgress()) return; //If game ended in any way ignore any bot move
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
