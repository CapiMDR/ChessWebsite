<div id="navigation">
  <a href="/ChessWebsite/Landing/index.php" id="homeLink">
    <h1 class="scalable">Chess Website</h1>
  </a>
  <form action="/ChessWebsite/Landing/logout.php" method="POST" id="logoutForm">
    <div id="userInfo">
      <h3 id="username"><?php echo isset($_SESSION['user']) ? htmlspecialchars($_SESSION['user']) : "Unknown"; ?></h3>
      <button class="btn-styled scalable" type="submit">Log Out</button>
    </div>
  </form>
</div>