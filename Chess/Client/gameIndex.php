<!DOCTYPE html>
<?php
    session_start();
?>

<html lang="en">
  <?php
    if (!isset($_SESSION['user'])){
        header('Location: ../../Landing/login.php');
        exit();
    }

    $mode = $_POST['mode'] ?? 'local'; // Game mode chosen from landing page
    if($mode!="online" && $mode!="bot" && $mode!="local" && $mode!="analyze") $mode='local'; //Change to local if invalid game mode
  ?>
  <head>
    <title>Playing Chess - Chess Website</title>
    <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.8/lib/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.8/lib/addons/p5.sound.min.js"></script>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="../../Assets/CSS/style.css">
    <link rel="stylesheet" type="text/css" href="../../Assets/CSS/game.css">
    <link rel="shortcut icon" href="../../Assets/Images/favicon.ico" type="image/x-icon">
    <meta charset="utf-8" />
    <script>
      //Passing game mode to JS
      window.gameMode = "<?php echo htmlspecialchars($mode, ENT_QUOTES); ?>";
      //If the game mode is analyze, we should expect a moves list to be sent as well
      <?php if (isset($_POST['pgn'])): ?>
        window.movesList = <?php echo json_encode($_POST['pgn']); ?>;
      <?php endif; ?>
    </script>
    <script type="module">
      import { handleGameStart, resignGame } from './ClientController.js';

      //Adding a listener to the play button to handle game start on press
      document.addEventListener("DOMContentLoaded", () => {
        const playBtn = document.getElementById("playBTN");
        if (playBtn) {
          playBtn.addEventListener("click", handleGameStart);
        }

        const resignBtn = document.getElementById("resignBTN");
        if (resignBtn) {
          resignBtn.addEventListener("click", resignGame);
        }
      });
    </script>
  </head>
  <body>
    <?php include('../../Components/backgroundArt.html'); ?>
    <div id="container">
      <?php include('../../Components/navigationBar.html'); ?>
      <div id="gameRow">
        <div id="leftColumn">
          <div id="movesContainer">
            <h3>Moves</h3>
            <ol id="movesList"></ol>
          </div>
          <div id="moveBTNS">
            <input type="button" class="btn-styled btn-large scalable" id="undoMoveBTN" value="↩" onclick="undoMove()"/>
            <input type="button" class="btn-styled btn-large scalable" id="redoMoveBTN" value="↪" onclick="redoMove()"/>

            <?php if ($mode === 'online'): ?>
              <button class="btn-styled btn-large scalable" id="resignBTN">
                <span class="material-icons">flag</span>
              </button>
            <?php endif; ?>
          </div>
        </div>
        <div id="canvasContainer">
          <div id="overlay">
            <?php if ($mode === 'online'): ?>
              <div class="loader-container">
                <div class="loader"></div>
                <p>Waiting for another player to join...</p>
              </div>
            <?php else: ?>
              <button class="btn-styled-red btn-larger" id="playBTN">
                <span class="material-icons" style="font-size: 3rem;">play_arrow</span>
              </button>
            <?php endif; ?>
          </div>
        </div>
      </div>
    </div>
    <main></main>
    <script type="module" src="./Renderer.js"></script>
    <script type="module" src="./Input.js"></script>
  </body>
</html>