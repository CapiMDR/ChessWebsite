<div id="navigation" class="styledBox">
<p>Chess</p>
<form action="/ChessWebsite/Landing/logout.php" method="POST">
    <?php echo isset($_SESSION['user']) ? htmlspecialchars($_SESSION['user']) : "Unknown"; ?>
    <button class="styledButton" type="submit">Log Out</button>
</form>
</div>