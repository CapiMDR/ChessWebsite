<!DOCTYPE html>
<?php
    session_start();
?>

<html lang="en">
  <?php
    if (!isset($_SESSION['user'])){
        header('Location: login.php');
    }
  ?>
  <head>
    <title>Home - Chess Website</title>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.8/lib/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.8/lib/addons/p5.sound.min.js"></script>
    <link rel="stylesheet" type="text/css" href="../Assets/CSS/style.css">
    <meta charset="utf-8" />
    <script>
      //Small script to set game mode and submit form automatically
      function setMode(mode) {
        document.getElementById('gameMode').value = mode;
        document.getElementById('gameForm').submit();
      }
    </script>
  </head>
  <body>
    <div id="container">
      <?php include('navigationBar.php'); ?>
      <div id="menuContainer">
        <div id="leftColumn" class="styledBox">
          <div id="menuBTNS">
            <form id="gameForm" action="/ChessWebsite/Chess/Client/gameIndex.php" method="GET">
            <input type="hidden" name="mode" id="gameMode" value="">
            <button class="styledButton btn-large" type="button" onclick="setMode('online')">Play online</button>
            <button class="styledButton btn-large" type="button" onclick="setMode('bot')">Play vs bot</button>
            <button class="styledButton btn-large" type="button" onclick="setMode('local')">Play local</button>
          </form>
          </div>
        </div>
        <div id="middleContainer">
            <input type="button" class="btn-styled-red btn-larger" id="playBTN" value="▶" onclick="startGame()"/>
        </div>
      </div>
    </div>
  </body>
</html>