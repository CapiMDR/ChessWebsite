<!DOCTYPE html>
<?php
    session_start();
?>

<html lang="en">
  <head>
    <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.8/lib/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.8/lib/addons/p5.sound.min.js"></script>
    <link rel="stylesheet" type="text/css" href="../../Assets/Css/style.css">
    <link rel="stylesheet" type="text/css" href="../../Assets/Css/game.css">
    <meta charset="utf-8" />
  </head>
  <body>
    <div id="container">
      <div id="navigation" class="styledBox">
        <input type="button" class="styledButton" id="controlsBTN" value="Controls" onclick="togglePopup()"/>
        <input type="text" class="styledTextField" id="textTXT"/>
        <input type="button" class="styledButton" id="fenBTN" value="Set position with FEN" onclick="setupBoard()"/>
        <input type="button" class="styledButton" id="startBTN" value="Start position" onclick="restartGame()"/>
        <input type="button" class="styledButton" id="importBTN" value="Import Game" onclick="importGame()"/>
        <p>White bot</p>
        <input type="checkbox" id="whiteBotBox"/>
        <p>Black bot</p>
        <input type="checkbox" id="blackBotBox"/>
        <form action="../../Landing/logout.php" method="POST">
          <?php echo htmlspecialchars($_SESSION['user']); ?>
          <button class="styledButton" type="submit">Log Out</button>
        </form>
      </div>
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
    <script type="module" src="./sketch.js"></script>
    <script type ="module" src="./Input.js"></script>
  </body>
</html>