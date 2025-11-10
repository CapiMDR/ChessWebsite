<?php
require_once("db_connect.php");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $user = $_POST["username"];
    $email = $_POST["email"];
    $pass = $_POST["password"];

    //limpíamos las variable
    $user = mysqli_real_escape_string($conn, $user);
    $email = mysqli_real_escape_string($conn, $email);
    $pass = mysqli_real_escape_string($conn, $pass);


    $checkIfUserExists_sql = "SELECT username FROM users WHERE username = '$user'";
    $result = $conn->query($checkIfUserExists_sql);

    if ($result->num_rows>0){
        echo "<script>alert('username is already registered'); window.location='register.php';</script>";
        exit;
    }

    $insertUser_sql = "INSERT INTO users (username, email, password) VALUES ('$user', '$email', '$pass')";

    if ($conn->query($insertUser_sql)){
        echo "<script>alert('Registration successful, now log in'); window.location='login.php';</script>";
    } else {
       echo "<script>alert('Error registering'); window.location='register.php';</script>";
    }
}
//cerramos la conexión a la base de datos.
$conn->close();
?>