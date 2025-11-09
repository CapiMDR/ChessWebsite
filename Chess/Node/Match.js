import { Engine, GameResult } from "../Shared/Engine.js";
import { Timer } from "../Shared/Timer.js";
import { Move } from "../Shared/Move.js";
import { white, black } from "../Shared/Constants.js";
import { sendToAllClients, respondToClient } from "./server.js";

export class Match {
  constructor(id, startFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
    this.ID = id;
    this.engine = new Engine(startFEN);

    this.whiteTimer = new Timer(5, 3);
    this.blackTimer = new Timer(5, 3);

    this.colorAssignments = { [white]: null, [black]: null };
    this.originalPlayers = { [white]: null, [black]: null };

    this.whiteTimer.addEventListener("timeout", () => this.handleTimeout(white));
    this.blackTimer.addEventListener("timeout", () => this.handleTimeout(black));
  }

  assignColor(playerId) {
    //If this game has started, only allow the players who started it to get a color, otherwise assign spectator
    if (this.gameHasStarted()) {
      for (const color of [white, black]) {
        if (this.originalPlayers[color] === playerId) {
          this.colorAssignments[color] = playerId;
          console.log(`Original ${color === white ? "white" : "black"} reconnected`);
          return color;
        }
      }
      return "spectator";
    }

    //Get a random color from available ones
    const available = [];
    if (!this.colorAssignments[white]) available.push(white);
    if (!this.colorAssignments[black]) available.push(black);
    if (available.length === 0) return "spectator";

    const assigned = available[Math.floor(Math.random() * available.length)];
    this.colorAssignments[assigned] = playerId;
    return assigned;
  }

  handlePlayerReady(socket, playerId) {
    const assignedColor = this.assignColor(playerId);
    respondToClient(socket, { type: "color", color: assignedColor });

    //Sync joining player's game to server's game if a reconnect
    if (this.gameHasStarted()) {
      respondToClient(socket, { type: "startGame" });
      respondToClient(socket, { type: "syncGame", gameStatus: this.getGameStatus() });
      return;
    }

    //Start game when both colors are occupied
    if (this.gameIsReady()) {
      this.startGame();
      sendToAllClients({ type: "startGame", matchID: this.ID });
    }
  }

  //If the game hasn't started, free up the color the player had
  handleDisconnect(playerId) {
    if (this.gameHasStarted()) return;
    for (const color of [white, black]) {
      if (this.colorAssignments[color] === playerId) {
        this.colorAssignments[color] = null;
      }
    }
  }

  startGame() {
    this.engine.startGame();
    this.originalPlayers[white] = this.colorAssignments[white];
    this.originalPlayers[black] = this.colorAssignments[black];
  }

  endGame() {
    const status = this.getGameStatus();
    sendToAllClients({ type: "endGame", matchID: this.ID, gameStatus: status });
    //TODO: Save game on database
    //TODO: Remove game from match manager
  }

  handleReceivedMove(move) {
    if (!this.isLegalMove(move)) return;
    const status = this.getGameStatus();
    sendToAllClients({ type: "move", matchID: this.ID, move: move, gameStatus: status });
    if (this.gameIsOver()) this.endGame();
  }

  isLegalMove(clientMove) {
    for (let move of this.engine.moves) {
      if (move == clientMove) {
        this.engine.playMove(clientMove, false);
        return true;
      }
    }
    console.log("Illegal move " + Move.toString(clientMove));
    return false;
  }

  handleTimeout(color) {
    if (this.gameIsOver()) return;
    this.engine.result = color === white ? GameResult.whiteTimeOut : GameResult.blackTimeOut;
    this.endGame();
  }

  gameIsReady() {
    return this.colorAssignments[white] && this.colorAssignments[black];
  }

  gameHasStarted() {
    return this.engine.result !== GameResult.starting;
  }

  gameIsOver() {
    return this.engine.result !== GameResult.starting && this.engine.result !== GameResult.inProgress;
  }

  getGameStatus() {
    return {
      clrToMove: this.engine.clrToMove,
      movesList: this.engine.moveHistory,
      whiteTime: this.whiteTimer.remainingTime,
      blackTime: this.blackTimer.remainingTime,
      gameResult: this.engine.result,
    };
  }
}
