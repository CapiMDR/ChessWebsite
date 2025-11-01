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
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <meta charset="utf-8" />
    <script>
      function setMode(mode) {
        document.getElementById('gameMode').value = mode;
        document.getElementById('gameForm').submit();
      }
    </script>
  </head>
  <body>
    <div class="chess-piece">♔</div>
    <div class="chess-piece">♛</div>
    <div id="container">
      <?php include('navigationBar.php'); ?>
      <div id="menuContainer">
        <div id="leftColumn" class="styledBox">
          <div id="menuBTNS">
            <form id="gameForm" action="/ChessWebsite/Chess/Client/gameIndex.php" method="GET">
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
        <div id="middleContainer">
          <button class="btn-styled-red btn-larger" id="playBTN">
            <span class="material-icons" style="font-size: 3rem;">play_arrow</span>
          </button>
        </div>
      </div>
    </div>
  </body>
</html>