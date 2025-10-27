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
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.8/lib/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.8/lib/addons/p5.sound.min.js"></script>
    <link rel="stylesheet" type="text/css" href="../Assets/CSS/style.css">
    <meta charset="utf-8" />
  </head>
  <body>
    <div id="container">
      <?php include('navigationBar.php'); ?>
      <div id="menuContainer">
        <div id="leftColumn" class="styledBox">
          <div id="menuBTNS">
            <form action="/ChessWebsite/Chess/Client/gameIndex.php" method="GET">
              <button class="styledButton btn-large" type="submit">Play online</button>
            </form>
            <form action="/ChessWebsite/Chess/Client/gameIndex.php" method="GET">
              <button class="styledButton btn-large" type="submit">Play vs bot</button>
            </form>
            <form action="/ChessWebsite/Chess/Client/gameIndex.php" method="GET">
              <button class="styledButton btn-large" type="submit">Play local</button>
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