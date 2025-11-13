import connection from "./db_connect.js";
import { GameResult } from "../Shared/Engine.js";

export async function saveGameToDB(whitePlayer, blackPlayer, gameResult, pgn) {
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
        INSERT INTO matchs (whitePlayerId, blackPlayerID, result, pgn, date) 
        VALUES (?, ?, ?, ?, NOW())
    `;

    try {
        //Save record for both white and black
        await connection.execute(query, [
            whitePlayer.id,
            blackPlayer.id,
            absoluteResult,
            pgn
        ]);

        console.log(`Game saved to 'matchs' table: WhiteID(${whitePlayer.id}) vs BlackID(${blackPlayer.id}). Result: ${absoluteResult}`);
    } catch (error) {
        console.error("Error saving game to DB:", error);
    }
}


//White win the Match
function didWhiteWin(result) {
    return result === GameResult.blackCheckmated || 
           result === GameResult.blackResigned || 
           result === GameResult.blackTimeOut;
}

//Black win the Match
function didBlackWin(result) {
    return result === GameResult.whiteCheckmated || 
           result === GameResult.whiteResigned || 
           result === GameResult.whiteTimeOut;
}