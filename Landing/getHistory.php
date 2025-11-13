<?php
session_start();
require_once("./db_connect.php");

header('Content-Type: application/json');

if (!isset($_SESSION['user']) || !isset($_SESSION['uuid'])) {
    echo json_encode(['user' => null, 'history' => []]);
    exit();
}

$currentUser = $_SESSION['user'];
$myID = $_SESSION['uuid']; //UUID from session to query the DB

/*
   1. Select columns: idMatch, whitePlayerId, blackPlayerID, result, pgn, date.
   2. JOIN with 'users' table TWICE (u1 for white player, u2 for black player) to get usernames from IDs.
   3. "checks" if the current user's ID matches either whitePlayerId OR blackPlayerID.
*/
$sql = "
    SELECT 
        m.idMatch as id, 
        m.date, 
        m.result as absolute_result, 
        m.pgn,
        m.whitePlayerId,
        m.blackPlayerId,
        u1.username as white_username,
        u2.username as black_username
    FROM matches m
    JOIN users u1 ON m.whitePlayerId = u1.id
    JOIN users u2 ON m.blackPlayerId = u2.id
    WHERE m.whitePlayerId = ? OR m.blackPlayerId = ?
    ORDER BY m.idMatch DESC
";

//Prepare the SQL statement using the connection object
if ($stmt = $conn->prepare($sql)) {
    //Bind the parameters to the placeholder (?) the parameters are strings
    $stmt->bind_param("ss", $myID, $myID);

    $stmt->execute();
    
    $result = $stmt->get_result();

    //Empty array for history
    $history = [];


    //fetch_assoc() returns the row as an associative array
    while ($row = $result->fetch_assoc()) {

        
        $amIWhite = isUserWhite($myID, $row['whitePlayerId']);
        //Determine My Color (for display)
        $myColorText = $amIWhite ? 'White' : 'Black';
        //Determine the opponent name
        $opponentName = $amIWhite ? $row['black_username'] : $row['white_username'];

        $myResult = determinePlayerResult($row['absolute_result'], $amIWhite);
        

        //add row in formatted data that profile.js expects
        $history[] = [
            'id' => $row['id'],
            'date' => $row['date'],
            'opponent' => $opponentName,
            'color' => $myColorText,
            'result' => $myResult,
            'pgn' => $row['pgn']
        ];
    }

    //Encode the data into JSON format
    echo json_encode(['user' => $currentUser, 'history' => $history]);
    $stmt->close();

} else {
    //failed
    echo json_encode(['user' => $currentUser, 'history' => []]);
}

$conn->close();

//Determine if the user plays as White
function isUserWhite($currentUserID, $whitePlayerID) {
    return $currentUserID === $whitePlayerID;
}

//Determines whether the user won, lost, or tied based on the absolute result.
function determinePlayerResult($absoluteResult, $amIWhite) {
    //White win
    if ($absoluteResult === 'White') {
        if ($amIWhite) return 'Win';
        else return 'Loss';           
    }

    //Black win
    if ($absoluteResult === 'Black') {
        if (!$amIWhite) return 'Win'; 
        else return 'Loss';           
    }

    return 'Draw'; //default value 
}
?>
