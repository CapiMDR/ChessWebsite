import { Match } from "./Match.js";
import { respondToClient } from "./server.js";

class MatchManager {
  constructor() {
    this.matches = new Map(); //gameId -> ServerGame
    this.playerToMatch = new Map(); //playerId -> gameId
  }

  onPlayerReady(socket, player, matchID) {
    let match;
    if (this.isReconnecting(player.id)) {
      //If this client is reconnecting to an existing match
      match = this.findMatchByPlayer(player.id);
      console.log(`Player ${player.username} reconnected to match ${match.ID}`);
    } else {
      //Player is not reconnecting (no known match or old match has been deleted)
      match = this.findNewMatch(socket, player.id, matchID);
    }

    if (match == null) return;

    console.log(`Player ${player.username} joining match ${match.ID}`);
    //Assign player to the match room
    socket.join(match.ID);
    //Let the match handle readiness / color assignment / start
    match.onPlayerJoin(socket, player);
    //Record mapping of the player to their match
    this.assignPlayerToMatch(player.id, match.ID);
  }

  findNewMatch(socket, playerID, matchID) {
    let match;
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
        return null;
      }
    }
    return match;
  }

  isReconnecting(playerID) {
    //Check if this player was already in a match (reconnect case)
    const previousMatch = this.findMatchByPlayer(playerID);
    return previousMatch != null;
  }

  onMoveReceived(move, matchID) {
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

  onPlayerDisconnect(player) {
    const match = this.findMatchByPlayer(player.id);
    if (!match) return;
    match.handleDisconnect(player);
    //If the game hasn't started "forget" that this client ever joined this match, otherwise remember for rejoining
    if (!match.gameHasStarted()) this.removePlayerFromMatch(player.id);
  }

  onResignation(player, matchID) {
    const match = this.getMatch(matchID);
    match.endGame(player);
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

  removeMatch(matchID) {
    //Deleting from matches map
    this.matches.delete(matchID);
    //Cleaning up player mapping
    for (const [playerId, gid] of this.playerToMatch.entries()) {
      if (gid === matchID) this.playerToMatch.delete(playerId);
    }
  }
}

export const matchManager = new MatchManager();
