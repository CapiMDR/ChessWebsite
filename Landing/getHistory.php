<?php
session_start();
require_once("../db_connect.php");

header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    echo json_encode(['user' => null, 'history' => []]);
    exit();
}

$currentUser = $_SESSION['user'];

// Define the SQL query selecting specific columns from the 'matches' table
// We use a placeholder (?) for the username to ensure security
$sql = "SELECT id, opponent, color, result, pgn, date FROM matches WHERE username = ? ORDER BY id DESC";

// Prepare the SQL statement using the connection object
if ($stmt = $conn->prepare($sql)) {
    // Bind the parameter to the placeholder (?) the parameter is a String
    $stmt->bind_param("s", $currentUser);

    $stmt->execute();
    
    $result = $stmt->get_result();

    //Empty array for history
    $history = [];


    //fetch_assoc() returns the row as an associative array
    while ($row = $result->fetch_assoc()) {
        $history[] = $row; // Add the current row
    }

    // Encode the data into JSON format
    echo json_encode(['user' => $currentUser, 'history' => $history]);
    $stmt->close();

} else {
    // If preparation failed
    echo json_encode(['user' => $currentUser, 'history' => [], 'error' => $conn->error]);
}

$conn->close();
?>
