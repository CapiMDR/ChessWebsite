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
    <title>Profile - Chess Website</title>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.8/lib/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.8/lib/addons/p5.sound.min.js"></script>
    <link rel="stylesheet" type="text/css" href="../Assets/CSS/style.css">
    <link rel="stylesheet" type="text/css" href="../Assets/CSS/profile.css">
    <link rel="shortcut icon" href="../Assets/Images/favicon.ico" type="image/x-icon">
    <meta charset="utf-8" />
  </head>
  <body>
    <?php include('../Components/backgroundArt.html'); ?>
    <?php include('../Components/navigationBar.html'); ?>
    <div class="profile-container">   
        <div id="profileSquare" class="styledBox">
            <?php $user = htmlspecialchars($_SESSION['user'])?>
            <div class="avatar-large"><?php echo $initial; ?> </div>
            <h2> <?php echo $user; ?> </h2>
            <div class="profile-stats">
                <div class="stat">
                    <div class="stat-number" id="gamesStat">—</div>
                    <p>Games</p>
                </div>
                <div class="stat">
                    <div class="stat-number" id="winsStat">—</div>
                    <p>Wins</p>
                </div>
                <div class="stat">
                    <div class="stat-number" id="lossesStat">—</div>
                    <p>Losses</p>
                </div>
            </div>
        </div>

        <div class="profile-content">
            <div class="history-header">
                <h2>Game History</h2>
                <div class="history-controls">
                    <input id="historySearch" class="styledTextField" placeholder="Search opponent or result..." />
                    <select id="historyFilter" class="styledTextField">
                        <option class="filter-option" value="all">All</option>
                        <option class="filter-option" value="win">Wins</option>
                        <option class="filter-option" value="loss">Losses</option>
                        <option class="filter-option" value="draw">Draws</option>
                    </select>
                </div>
            </div>
            <form id="profileForm" action="/ChessWebsite/Chess/Client/gameIndex.php" method="POST">
                <input type="hidden" name="mode" id="gameMode" value="analyze">
                <input type="hidden" name="pgn" id="movesList" value="">
                <div id="historyList" class="history-list styledBox">
                </div>
            </form>
        </div>
    </div>
    <script src="profile.js"></script>
  </body>
</html>