<?php
    session_start();
?>

<?php
//Fetching user input from login.php
$user = isset($_POST['user']) ? $_POST['user'] : "";
$password = isset($_POST['password']) ? $_POST['password'] : "";

$savedUser="Bob";
$savedPassword="Marley";

if(isValidAccount($user, $password)){
    $_SESSION['user'] = $user;
    echo "valid";
}else{
    echo "invalid";
}

function isValidAccount($user, $password){
    global $savedUser;
    global $savedPassword;
    return $user == $savedUser && $password == $savedPassword;
}
