<!DOCTYPE html>
<?php
    session_start();
?>
<html>
    <head>
        <title>Register - Chess Website</title>
        <meta charset="UTF-8">
        <link href="../../Assets/CSS/style.css" rel="stylesheet">
        <link href="../../Assets/CSS/login.css" rel="stylesheet">
        <link rel="shortcut icon" href="../../Assets/Images/favicon.ico" type="image/x-icon">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>

        <script src="register.js"></script>
    </head>
    <body>
    <?php include('../../Widgets/backgroundArt.html'); ?>
    <?php include('../../Widgets/popUp.html'); ?>
        <div id="container" class="login-container">
            <div class="login-box styledBox">
                    <form id="registerForm" class="login-form" onsubmit="registerAccount(event)">
                    <div class="form-group">
                        <label for="username">
                            <span class="material-icons">person</span>
                            Username
                        </label>
                        <input type="text" class="styledTextField" id="username" name="username" autocomplete="username" required>
                    </div>
                    <div class="form-group">
                        <label for="email">
                            <span class="material-icons">email</span>
                            Email
                        </label>
                        <input type="email" class="styledTextField" id="email" name="email" autocomplete="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">
                            <span class="material-icons">lock</span>
                            Password
                        </label>
                        <input type="password" class="styledTextField" id="password" name="password" autocomplete="new-password" required>
                    </div>
                    <button type="submit" class="btn-styled-red login-btn">
                        <span class="material-icons">person_add</span>
                        Register
                    </button>
                    <p style="text-align:center; margin-top:10px;">
                        <span class="menu-txt">Already have an account?</span>
                        <a href="../Login/login.php" class="link-text">Log in</a>
                    </p>
                </form>
                </div>
            </div>
    </body>
</html>
