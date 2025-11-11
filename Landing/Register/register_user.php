<?php
require_once("../db_connect.php");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $user = $_POST["username"] ?? '';
    $email = $_POST["email"] ?? '';
    $pass = $_POST["password"] ?? '';

    $user = mysqli_real_escape_string($conn, $user);
    $email = mysqli_real_escape_string($conn, $email);
    $pass = mysqli_real_escape_string($conn, $pass);

    $response = [
        'success' => false,
        'message' => 'Error registering'
    ];

    $checkIfUserExists_sql = "SELECT username FROM users WHERE username = '$user'";
    $result = $conn->query($checkIfUserExists_sql);

    if ($result->num_rows > 0) {
        $response['message'] = 'Username is already registered';
        respond($response, $conn);
    }

    $insertUser_sql = "INSERT INTO users (username, email, password) VALUES ('$user', '$email', '$pass')";

    if ($conn->query($insertUser_sql)){
        $response['success'] = true;
        $response['message'] = 'Registration successful, now log in';
    } else {
        $response['message'] = 'Error registering';
    }
    
    respond($response, $conn);
}

function respond($response, $conn) {
    header('Content-Type: application/json');
    echo json_encode($response);

    $conn->close();
    exit;
}
?>