<!DOCTYPE html>
<?php
    session_start();
?>

<html lang="en">
  <?php
    if (!isset($_SESSION['user'])){
        header('Location: ./Login/login.php');
    }
  ?>
  <head>
    <title>Home - Chess Website</title>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.8/lib/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.8/lib/addons/p5.sound.min.js"></script>
    <link rel="stylesheet" type="text/css" href="../Assets/CSS/style.css">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="shortcut icon" href="../Assets/Images/favicon.ico" type="image/x-icon">
    <meta charset="utf-8" />
    <script>
      function setMode(mode) {
        document.getElementById('gameMode').value = mode;
        document.getElementById('gameForm').submit();
      }
    </script>
  </head>
  <body>
    <?php include('../Widgets/backgroundArt.html'); ?>
    <div id="container">
      <?php include('../Widgets/navigationBar.html'); ?>
      <div id="menuContainer">
        <div id="leftColumn" class="styledBox">
          <div id="menuBTNS">
            <form id="gameForm" action="/ChessWebsite/Chess/Client/gameIndex.php" method="POST">
              <input type="hidden" name="mode" id="gameMode" value="">
              <button class="btn-styled btn-large movable" type="button" onclick="setMode('online')">
                <span class="material-icons">people</span>
                Play Online
              </button>
              <button class="btn-styled btn-large movable" type="button" onclick="setMode('bot')">
                <span class="material-icons">smart_toy</span>
                Play vs Bot
              </button>
              <button class="btn-styled btn-large movable" type="button" onclick="setMode('local')">
                <span class="material-icons">person</span>
                Play Local
              </button>
            </form>
          </div>
        </div>
        <div id="middleContainer" style="position: relative; display: inline-block;">
          <!-- Clipped bottom image -->
          <div id="circleGlow">
            <img src="../Assets/Images/RadialImage.png" class="spinnable" style="width: 98%; height: auto;">
          </div>

          <!-- Middle image -->
          <img src="../Assets/Images/MainImage.png" style="width: 98%; height: auto; position: relative; z-index: 2;">

          <!-- Top button -->
          <button class="btn-styled-red btn-larger img-btn" id="playBTN" onclick="setMode('online')">
            <span class="material-icons" style="font-size: 3rem;">play_arrow</span>
          </button>
        </div>
      </div>
    </div>
  </body>
</html>