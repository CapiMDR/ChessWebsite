import connection from "./db_connect.js";
import { GameResult } from "../Shared/Engine.js";

export async function saveGameToDB(whitePlayer, blackPlayer, gameResult, pgn) {
   //Validating that we have the player's data
    if (!whitePlayer || !blackPlayer) {
        console.log("Cannot save game: missing player data.");
        return;
    }

    //Determining result as TEXT
    let whiteResult = "Draw";
    let blackResult = "Draw";

    if (didBlackWin(gameResult)) {
        whiteResult = "Loss";
        blackResult = "Win";
    } else if (didWhiteWin(gameResult)) {
        whiteResult = "Win";
        blackResult = "Loss";
    }

    // Query pointing to the "matches" table
    const query = `
        INSERT INTO matches (username, opponent, color, result, pgn, date) 
        VALUES (?, ?, ?, ?, ?, NOW())
    `;

    try {
        //Save record for white
        await connection.execute(query, [
            whitePlayer.username,
            blackPlayer.username,
            'White',
            whiteResult,
            pgn
        ]);

        //Save record for black
        await connection.execute(query, [
            blackPlayer.username,
            whitePlayer.username,
            'Black',
            blackResult,
            pgn
        ]);

        console.log(`Game saved to 'matches' table: ${whitePlayer.username} vs ${blackPlayer.username}`);
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