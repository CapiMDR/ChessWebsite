<!DOCTYPE html>
<?php
    session_start();
?>

<html lang="en">
  <?php
    if (!isset($_SESSION['user'])){
        header('Location: ../../Landing/login.php');
    }

    $mode = $_GET['mode'] ?? 'online'; //Game mode chosen from landing page
  ?>
  <head>
    <title>Playing Chess</title>
    <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.8/lib/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.8/lib/addons/p5.sound.min.js"></script>
    <link rel="stylesheet" type="text/css" href="../../Assets/CSS/style.css">
    <link rel="stylesheet" type="text/css" href="../../Assets/CSS/game.css">
    <meta charset="utf-8" />
    <script>
      //Small script to pass game mode to ClientController.js
      window.gameMode = "<?php echo htmlspecialchars($mode, ENT_QUOTES); ?>";
    </script>
  </head>
  <body>
    <div id="container">
      <?php include('../../Landing/navigationBar.php'); ?>
      <div id="gameRow">
        <div id="leftColumn">
          <div id="movesContainer">
            <h3>Moves</h3>
            <ol id="movesList">
            </ol>
          </div>
          <div id="moveBTNS">
            <input type="button" class="styledButton btn-large" id="undoMoveBTN" value="↩" onclick="undoMove()"/>
            <input type="button" class="styledButton btn-large" id="redoMoveBTN" value="↪" onclick="redoMove()"/>
          </div>
        </div>
        <div id="canvasContainer">
          <div id="overlay">
            <input type="button" class="btn-styled-red btn-larger" id="playBTN" value="▶" onclick="startGame()"/>
          </div>
        </div>
      </div>
    </div>
    <main>
    </main>
    <script type="module" src="./Renderer.js"></script>
    <script type ="module" src="./Input.js"></script>
  </body>
</html>