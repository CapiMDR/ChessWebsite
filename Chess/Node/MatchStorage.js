import connection from "./db_connect.js";
import { GameResult } from "../Shared/Engine.js";

export async function saveGameToDB(matchID, whitePlayer, blackPlayer, gameResult, pgn) {
  //Validating that we have the player's data
  if (!whitePlayer || !blackPlayer) {
    console.log("Cannot save game: missing player data.");
    return;
  }

  // Determine the absolute winner ('White', 'Black', or 'Draw')
  let absoluteResult = "Draw";

  if (didWhiteWin(gameResult)) {
    absoluteResult = "White";
  } else if (didBlackWin(gameResult)) {
    absoluteResult = "Black";
  }

  // Query pointing to the "matches" table
  const query = `
        INSERT INTO matches (idMatch, whitePlayerId, blackPlayerID, result, pgn, date) 
        VALUES (?, ?, ?, ?, ?, NOW())
    `;

  try {
    //Save record
    await connection.execute(query, [matchID, whitePlayer.id, blackPlayer.id, absoluteResult, pgn]);

    console.log(`Game saved to 'matches' table: WhiteID(${whitePlayer.id}) vs BlackID(${blackPlayer.id}). Result: ${absoluteResult}`);
  } catch (error) {
    console.error("Error saving game to DB:", error);
  }
}

//White won the match
function didWhiteWin(result) {
  //Result whiteCheckmated means white "performed a checkmate move (black lost)". I know, dumb name
  return result === GameResult.whiteCheckmated || result === GameResult.blackResigned || result === GameResult.blackTimeOut;
}

//Black won the match
function didBlackWin(result) {
  return result === GameResult.blackCheckmated || result === GameResult.whiteResigned || result === GameResult.whiteTimeOut;
}
