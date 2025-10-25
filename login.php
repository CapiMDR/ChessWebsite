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
        <title>Log in</title>
        <meta charset="UTF-8">
        <link href="menu.css" rel="stylesheet">
        <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>
        <script>
            function authenticateAccount() {
                const user = document.getElementById("user").value;
                const password = document.getElementById("password").value;

                const formData = new FormData();
                formData.append("user", user);
                formData.append("password", password);
                
                //Enviando el usuario y contraseña introducidos por el usuario al valida.php para ser validados
                fetch("authenticate.php", {
                    method: "POST",
                    body: formData
                })
                .then(response => response.text())
                .then(data => {
                    if (data.trim() === "valid") {
                        location.assign("index.html");
                    } else {
                        console.log(data.trim());
                    }
                })
                .catch(error => console.error("Error:", error));
            }
        </script>
    </head>
    <body data-bs-theme="white">
            <div class="centerCard">
                <div id="container">
                    <div class="col-md-6 col-lg-4">
                        <div class="card">
                            <div class="card-body">
                                <h3 class="card-title text-center mb-4">Log in</h3>
                                <form id="loginForm">
                                    <div class="mb-3">
                                        <label for="usuario" class="form-label">User</label> 
                                        <input type="text" class="form-control" id="user" name="user" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="password" class="form-label">Password</label> 
                                        <input type="password" class="form-control" id="password" name="password" required>
                                    </div>
                                    <div class="d-grid">
                                        <button type="button" class="btn-styled-red" onclick="authenticateAccount()">Login</button>
                                    </div>
                                </form>
                                <div id="errorMsg" class="mt-3 text-danger text-center" style="display:none;">
                                    Invaid user or password.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>  

            <div class="modal fade" id="errorModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title">Error</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="modalMensaje">

                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        <script src="script.js"></script>
    </body>
</html>
