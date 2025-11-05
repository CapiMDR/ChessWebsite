<!DOCTYPE html>
<?php
    session_start();
?>
<html>
    <?php
        if (isset($_SESSION['nombre'])){
            header('Location: login.php');
        }
    ?>
    <head>
        <title>Log in - Chess Website</title>
        <meta charset="UTF-8">
        <link href="../Assets/CSS/style.css" rel="stylesheet">
        <link href="../Assets/CSS/login.css" rel="stylesheet">
        <link rel="shortcut icon" href="../Assets/Images/favicon.ico" type="image/x-icon">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>
        
        <script src="authenticate.js"></script>
    </head>
    <body>
        <?php include('../Components/backgroundArt.html'); ?>
        <div id="container" class="login-container">
            <div class="login-box styledBox">
                <form id="loginForm" class="login-form" onsubmit="authenticateAccount(event)">
                    <div class="form-group">
                        <label for="user">
                            <span class="material-icons">person</span>
                            Username
                        </label>
                        <input type="text" class="styledTextField" id="user" name="user" required>
                    </div>
                    <div class="form-group">
                        <label for="password">
                            <span class="material-icons">lock</span>
                            Password
                        </label>
                        <input type="password" class="styledTextField" id="password" name="password" required>
                    </div>
                    <button type="submit" class="btn-styled-red login-btn">
                        <span class="material-icons">login</span>
                        Log in
                    </button>
                </form>
            </div>
        </div>

        <div class="modal fade" id="errorModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header text-white">
                        <h5 class="modal-title">Error</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="modalMsg">

                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
