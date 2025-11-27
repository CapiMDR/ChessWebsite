<!DOCTYPE html>
<?php
    session_start();
?>

<html lang="en">
  <?php
    if (!isset($_SESSION['user'])){
        header('Location: ../../Landing/Login/login.php');
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
      //Passing UUID to JS
      window.uuid="<?php echo $_SESSION['uuid']; ?>";
      //Passing game mode to JS
      window.gameMode = "<?php echo htmlspecialchars($mode, ENT_QUOTES); ?>";
      //If the game mode is analyze, we should expect a moves list to be sent as well
      <?php if (isset($_POST['pgn'])): ?>
        window.movesList = <?php echo json_encode($_POST['pgn']); ?>;
      <?php endif; ?>
    </script>
  </head>
  <body>
    <?php include('../../Widgets/backgroundArt.html'); ?>
    <div id="container">
      <?php include('../../Widgets/navigationBar.html'); ?>
      <div id="gameRow">
        <div id="leftColumn">
          <div id="movesContainer">
            <h3>Moves</h3>
            <ol id="movesList"></ol>
          </div>
          <div id="moveBTNS">
            <input type="button" class="btn-styled-disabled btn-large" id="undoMoveBTN" value="↩" data-action="undoMove"/>
            <input type="button" class="btn-styled-disabled btn-large" id="redoMoveBTN" value="↪" data-action="redoMove"/>
            <?php if ($mode === 'online'): ?>
              <button class="btn-styled-disabled btn-large" id="resignBTN" data-action="resign">
                <span class="material-icons">flag</span>
              </button>
            <?php endif; ?>
            <?php if ($mode === 'analyze'): ?>
              <button class="btn-styled btn-large scalable" id="hintBTN" data-action="getHint">
                <span class="material-icons">lightbulb</span>
              </button>
            <?php endif; ?>
          </div>
        </div>
      <div id="boardContainer">
        <div id="overlay">
          <?php if ($mode === 'online'): ?>
          <div class="loader-container">
              <div class="loader"></div>
              <p>Waiting for another player to join...</p>
          </div>
          <?php elseif ($mode === 'local'): ?>
            <button class="btn-styled-red btn-larger" id="playBTN" data-action="startGame">
                <span class="material-icons" style="font-size: 3rem;">play_arrow</span>
            </button>
          <?php elseif ($mode === 'bot'): ?>
            <?php include('./gameOptions.html'); ?>
          <?php endif; ?>
        </div>
      </div>
        <div id="rightColumn" class="<?php echo ($mode !== 'online') ? 'no-chat' : ''; ?>">
          <div id="UIContainer"></div>
          <?php if ($mode === 'online'): ?>
            <div class="styledBox" id="chatContainer">
                <ul id="chatList"></ul>
                <div id="chatInputRow">
                    <input type="text" id="chatTXT" class="styledTextField" placeholder="Type a message...">
                    <button id="chatSendBTN" class="btn-styled-disabled" data-action="sendChat" type="button">
                        <span class="material-icons">send</span>
                    </button>
                </div>
            </div>
          <?php endif; ?>
      </div>
      </div>
    </div>
    <main></main>
    <script type="module" src="./Renderers/MainRenderer.js"></script>
    <script type="module" src="./Controllers/UIController.js"></script>
    <script type="module" src="./Input.js"></script>
  </body>
</html>