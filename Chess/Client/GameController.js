/**
 * Handles all local game logic (starting, ending, move-making)
 */

import { Move } from "../Shared/Move.js";
import { Engine, GameResult } from "../Shared/Engine.js";
import { Timer } from "../Shared/Timer.js";
import { uiController } from "./UIController.js";
import { white, black } from "../Shared/Constants.js";
import { serverEvents } from "./ClientNetwork.js";

export class GameController {
  constructor(startFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
    this.gameMode = window.gameMode;
    this.startFEN = startFEN;

    this.whiteMinutes = 5;
    this.whiteIncrementSeconds = 3;
    //Minutes & increment in seconds
    this.whiteTimer = new Timer(this.whiteMinutes, this.whiteIncrementSeconds);

    this.blackMinutes = 5;
    this.blackIncrementSeconds = 3;
    this.blackTimer = new Timer(this.blackMinutes, this.blackIncrementSeconds);

    this.engine = new Engine(startFEN);
    this.engine.setTimers(this.whiteTimer, this.blackTimer);

    //Listening to timer events
    this.whiteTimer.addEventListener("timeout", () => this.handleLocalTimeout(white));
    this.blackTimer.addEventListener("timeout", () => this.handleLocalTimeout(black));

    serverEvents.addEventListener("startGame", () => this.handleGameStart());
    serverEvents.addEventListener("endGame", (e) => {
      this.handleGameEnd(e.detail.gameStatus.gameResult);
    });
  }

  handleLocalTimeout(color) {
    //Ignore local time outs if playing online (wait for server to notify game over)
    if (this.gameMode == "online") return;
    const result = color === white ? GameResult.whiteTimeOut : GameResult.blackTimeOut;
    this.handleGameEnd(result);
  }

  handleGameStart() {
    document.getElementById("overlay").style.display = "none"; //Disabling shadow over canvas
    this.engine.startGame();
    uiController.playSound("Start");
  }

  handleGameEnd(result) {
    this.engine.result = result;
    this.engine.timers[white].stop();
    this.engine.timers[black].stop();
    uiController.playSound("End");
  }

  //Any move received is played on the local board
  playMoveLocally(move, shouldPlaySounds = true) {
    if (this.gameIsOver()) return;

    //TODO: Allow for move undoing/redoing during the game and resynching the board when a new move arrives
    if (shouldPlaySounds) uiController.playMoveSound(move);
    uiController.updateMoveList(move);
    this.engine.playMove(move, false);
    if (this.engine.inCheck && shouldPlaySounds) uiController.playSound("Check");

    //Handle local game end (only when not playing online as that should stay server-authoritative)
    if (this.gameMode == "online") return;
    if (this.gameIsOver()) this.handleGameEnd(this.engine.result);
  }

  gameIsOver() {
    return this.engine.result != GameResult.starting && this.engine.result != GameResult.inProgress;
  }

  //Imports a game written in UCI format (ex e2e4)
  importUCIGame(movesString) {
    const movePattern = /\b[a-h][1-8][a-h][1-8][qrbn]?\b/g;
    const moveArray = movesString.match(movePattern) || [];
    for (let UCImove of moveArray) {
      const move = Move.UCIToMove(UCImove, this.engine.board);
      this.playMoveLocally(move, false);
    }
  }

  //Imports a game written in SAN format (ex Nf3)
  importSANGame(movesString) {
    //Remove move numbers like "1-e4", "2-Nf3", "3..." etc.
    const sanitized = movesString.replace(/\d+[-.]/g, "");

    //Split by whitespace to get individual SAN moves
    const sanMoves = sanitized.trim().split(/\s+/);

    for (let sanMove of sanMoves) {
      //Convert SAN → UCI using your SANToUCI method
      const uci = Move.SANToUCI(sanMove, this.engine.board);

      if (!uci) {
        console.warn("Could not convert SAN move:", sanMove);
        continue;
      }

      const move = Move.UCIToMove(uci, this.engine.board);
      this.playMoveLocally(move, false);
    }
  }
}

export const gameController = new GameController();
export const engine = gameController.engine;
