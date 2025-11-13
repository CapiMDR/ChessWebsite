<!DOCTYPE html>
<?php
session_start();

if (isset($_SESSION['user'])){
    header('Location: ../index.php');
    exit();
}
?>
<html lang="en">
  <head>
    <title>Log in - Chess Website</title>
    <meta charset="UTF-8">
    <link href="../../Assets/CSS/style.css" rel="stylesheet">
    <link href="../../Assets/CSS/login.css" rel="stylesheet">
    <link rel="shortcut icon" href="../../Assets/Images/favicon.ico" type="image/x-icon">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>

    <script src="authenticate.js"></script>
  </head>

  <body>
    <?php include('../../Components/backgroundArt.html'); ?>
    <?php include('../../Components/popUp.html'); ?>
    <div id="container" class="login-container">
      <div class="login-box styledBox">
        <form id="loginForm" class="login-form" onsubmit="authenticateAccount(event)">
          <div class="form-group">
            <label for="user">
              <span class="material-icons">person</span>
              Username
            </label>
            <input type="text" class="styledTextField" id="user" name="user" autocomplete="username" required>
          </div>
          <div class="form-group">
            <label for="password">
              <span class="material-icons">lock</span>
              Password
            </label>
            <input type="password" class="styledTextField" id="password" name="password" autocomplete="current-password" required>
          </div>
          <button type="submit" class="btn-styled-red login-btn">
            <span class="material-icons">login</span>
            Log in
          </button>
            <p style="text-align:center; margin-top:10px;">
              <span class="menu-txt">Don't have an account?</span>
              <a href="../Register/register.php" class="link-text">Register here</a>
            </p>   
        </form>
      </div>
    </div>
  </body>
</html>