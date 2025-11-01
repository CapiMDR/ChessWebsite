<div id="navigation" class="styledBox">
  <a href="/ChessWebsite/Landing/index.php" id="homeLink">
    <h1>Chess</h1>
  </a>
  <form action="/ChessWebsite/Landing/logout.php" method="POST" id="logoutForm">
    <div id="userInfo">
      <h3 id="username"><?php echo isset($_SESSION['user']) ? htmlspecialchars($_SESSION['user']) : "Unknown"; ?></h3>
      <button class="styledButton" type="submit">Log Out</button>
    </div>
  </form>
</div>