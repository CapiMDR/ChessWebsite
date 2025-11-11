<?php
session_start();
require_once("../db_connect.php");

$user = isset($_POST['user']) ? $_POST['user'] : "";
$password = isset($_POST['password']) ? $_POST['password'] : "";

$user = mysqli_real_escape_string($conn, $user);
$password = mysqli_real_escape_string($conn, $password);


$searchUser_sql = "SELECT username FROM users WHERE username='$user' AND password='$password'";
$result = $conn->query($searchUser_sql);

if ($result && $result->num_rows>0){
    $_SESSION['user'] = $user;
    echo "valid";
} else {
    echo "invalid";
}

$conn->close();
?>