import { Match } from "./Match.js";
import { respondToClient } from "./server.js";

class MatchManager {
  constructor() {
    this.matches = new Map(); //gameId -> ServerGame
    this.playerToMatch = new Map(); //playerId -> gameId
  }

  onPlayerReady(socket, playerID, matchID) {
    let match;

    //Check if this player was already in a match (reconnect case)
    const previousMatch = this.findMatchByPlayer(playerID);
    if (previousMatch) {
      console.log(`Player ${playerID} reconnected to match ${previousMatch.ID}`);
      socket.join(previousMatch.ID);
      previousMatch.handlePlayerReady(socket, playerID);
      respondToClient(socket, { type: "joinMatch", matchID: previousMatch.ID });
      return; //Stop here, player successfully rejoined
    }

    //Player is not reconnecting (no known match or old match gone)
    if (!matchID) {
      //Try to find a match that hasn't started and isn't full
      match = this.findOpenMatch();

      //No open match found, create a new one
      if (!match) {
        console.log("No empty matches found, creating a new one");
        match = this.createMatch();
      }
    } else {
      //Player provided a specific match ID, try to join it
      match = this.getMatch(matchID);
      if (!match) {
        console.log(`Player ${playerID} tried to join non-existent match ${matchID}`);
        respondToClient(socket, { type: "error", message: "Invalid match ID" });
        return;
      }
    }

    console.log(`Player ${playerID} joining match ${match.ID}`);
    //Assign player to the match room
    socket.join(match.ID);
    //Tell client which match they joined
    respondToClient(socket, { type: "joinMatch", matchID: match.ID });
    //Let the match handle readiness / color assignment / start
    match.handlePlayerReady(socket, playerID);
    //Record mapping of the player to their match
    this.assignPlayerToMatch(playerID, match.ID);
  }

  onMoveReceived(matchID, move) {
    if (!matchID || !move) {
      console.log("Move message missing matchID or move");
      return;
    }

    const match = this.getMatch(matchID);
    if (!match) {
      console.log(`Move for non-existent match ${matchID}`);
      return;
    }

    match.handleReceivedMove(move);
  }

  onPlayerDisconnect(playerID) {
    const match = this.findMatchByPlayer(playerID);
    if (match) match.handleDisconnect(playerID);
    //If the game hasn't started "forget" that this client ever joined this match, otherwise remember for rejoining
    if (!match.gameHasStarted()) this.removePlayerFromMatch(playerID);
  }

  createMatch() {
    const id = crypto.randomUUID();
    const match = new Match(id);
    this.matches.set(id, match);
    return match;
  }

  findOpenMatch() {
    for (const match of this.matches.values()) {
      if (!match.gameHasStarted() && !match.gameIsReady()) {
        return match;
      }
    }
    return null;
  }

  getMatch(id) {
    return this.matches.get(id);
  }

  findMatchByPlayer(playerId) {
    const gameId = this.playerToMatch.get(playerId);
    return gameId ? this.getMatch(gameId) : null;
  }

  assignPlayerToMatch(playerId, gameId) {
    this.playerToMatch.set(playerId, gameId);
  }

  removePlayerFromMatch(playerId) {
    this.playerToMatch.delete(playerId);
  }

  removeMatch(id) {
    this.matches.delete(id);
    //Clean up player mapping
    for (const [playerId, gid] of this.playerToMatch.entries()) {
      if (gid === id) this.playerToMatch.delete(playerId);
    }
  }
}

export const matchManager = new MatchManager();
