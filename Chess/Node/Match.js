import { Engine, GameResult } from "../Shared/Engine.js";
import { Timer } from "../Shared/Timer.js";
import { Move } from "../Shared/Move.js";
import { white, black } from "../Shared/Constants.js";
import { sendToAllClients, respondToClient } from "./server.js";
import { matchManager } from "./MatchManager.js";

export class Match {
  constructor(id, startFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
    this.ID = id;
    this.engine = new Engine(startFEN);

    this.whiteTimer = new Timer(5, 3);
    this.blackTimer = new Timer(5, 3);
    this.engine.setTimers(this.whiteTimer, this.blackTimer);

    this.colorAssignments = { [white]: null, [black]: null }; //Colors occupied by players currently in the match (can change before game starts if a player disconnects)
    this.originalPlayers = { [white]: null, [black]: null }; //Players that started the game for handling reconnects

    this.whiteTimer.addEventListener("timeout", () => this.handleTimeout(white));
    this.blackTimer.addEventListener("timeout", () => this.handleTimeout(black));
  }

  assignColor(player) {
    //If this game has started, only allow the players who started it to get a color, otherwise assign spectator
    if (this.gameHasStarted()) {
      for (const color of [white, black]) {
        if (this.originalPlayers[color].id === player.id) {
          this.colorAssignments[color] = player;
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
    this.colorAssignments[assigned] = player;
    return assigned;
  }

  handlePlayerReady(socket, player) {
    const assignedColor = this.assignColor(player);
    //Tell client which match they joined and as which color
    respondToClient(socket, { type: "joinMatch", matchID: this.ID, color: assignedColor });

    //Sync joining player's game to server's game if a reconnect
    if (this.gameHasStarted()) {
      respondToClient(socket, {
        type: "startGame",
        matchID: this.ID,
        players: { white: this.colorAssignments[white], black: this.colorAssignments[black] },
      });
      respondToClient(socket, { type: "syncGame", gameStatus: this.getGameStatus() });
      return;
    }

    //Start game when both colors are occupied
    if (this.gameIsReady()) {
      this.startGame();
      sendToAllClients({
        type: "startGame",
        matchID: this.ID,
        players: { white: this.colorAssignments[white], black: this.colorAssignments[black] },
      });
    }
  }

  //If the game hasn't started, free up the color the player had
  handleDisconnect(player) {
    if (this.gameHasStarted()) return;
    for (const color of [white, black]) {
      if (!this.colorAssignments[color]) continue;
      if (this.colorAssignments[color].id === player.id) {
        this.colorAssignments[color] = null;
      }
    }
  }

  startGame() {
    this.engine.startGame();
    this.originalPlayers[white] = this.colorAssignments[white];
    this.originalPlayers[black] = this.colorAssignments[black];
  }

  endGame(resignedPlayer = null) {
    const status = this.getGameStatus();
    if (resignedPlayer) {
      const whiteResigned = this.originalPlayers[white].id == resignedPlayer.id;
      status.gameResult = whiteResigned ? GameResult.whiteResigned : GameResult.blackResigned;
    }
    this.engine.timers[white].stop();
    this.engine.timers[black].stop();
    sendToAllClients({ type: "endGame", matchID: this.ID, gameStatus: status });
    matchManager.removeMatch(this.ID);

    //TODO: Save game on database
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
      whiteTime: this.engine.timers[white].remainingTime,
      blackTime: this.engine.timers[black].remainingTime,
      gameResult: this.engine.result,
    };
  }
}
