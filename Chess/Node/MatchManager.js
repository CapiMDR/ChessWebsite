import { Match } from "./Match.js";

class MatchManager {
  constructor() {
    this.matches = new Map(); //gameId -> ServerGame
    this.playerToMatch = new Map(); //playerId -> gameId
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
