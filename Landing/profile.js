//Fetch and render the player's game history
(async function () {
  const listElement = document.getElementById("historyList");
  const statGames = document.getElementById("gamesStat");
  const statWins = document.getElementById("winsStat");
  const statLosses = document.getElementById("lossesStat");
  const searchElement = document.getElementById("historySearch");
  const filterElement = document.getElementById("historyFilter");

  let history = [];

  async function loadHistory() {
    const res = await fetch("getHistory.php");
    const data = await res.json();
    history = data.history || [];
    renderList(history);
    renderStats(history);
  }

  //Shows text for number of wins/draws/losses under avatar
  function renderStats(history) {
    statGames.textContent = history.length;
    let wins = 0;
    let losses = 0;
    for (let game of history) {
      wins += game.result.toLowerCase() == "win" ? 1 : 0;
      losses += game.result.toLowerCase() == "loss" ? 1 : 0;
    }
    statWins.textContent = wins;
    statLosses.textContent = losses;
  }

  //Fetches visual badge type according to the game result
  function badgeForResult(result) {
    switch (result.toLowerCase()) {
      case "win":
        return '<span class="result-badge win">Win</span>';
      case "loss":
        return '<span class="result-badge loss">Loss</span>';
      default:
        return '<span class="result-badge draw">Draw</span>';
    }
  }

  function renderList(items) {
    if (!items.length) {
      listElement.innerHTML = '<p class="muted">No games found.</p>';
      return;
    }

    listElement.innerHTML = items
      .map(
        (game) => `
        <div class="history-item" onclick="viewPGN(${game.id})">
          <div class="history-row">
            <div class="history-meta">
              <div class="opp">vs <strong>${game.opponent}</strong></div>
              <div class="when">${game.date}</div>
            </div>
            <div class="history-right">
              <div class="color">${game.color}</div>
              ${badgeForResult(game.result)}
            </div>
          </div>
          <div class="pgn" id="pgn-${game.id}">
            <p> ${game.pgn} </p>
            <button class="btn-styled btn-small" type="button" onclick="event.stopPropagation(); analyzeGame(${game.id})">Analyze</button>
          </div>
        </div>
      `
      )
      .join("");
  }

  //When the user clicks on a view button, find the corresponding element to show using the game ID
  window.viewPGN = function (id) {
    const dropDown = document.getElementById(`pgn-${id}`);
    if (!dropDown) return;
    //Close other open panels so only one is expanded at a time
    document.querySelectorAll(".pgn.open").forEach((el) => {
      if (el.id !== dropDown.id) el.classList.remove("open");
    });

    //Toggle an "open" class for smooth animation
    dropDown.classList.toggle("open");
  };

  window.analyzeGame = function (id) {
    let gameToAnalyze;
    //Finding game to analyze
    for (let game of history) {
      if (game.id == id) {
        gameToAnalyze = game;
        break;
      }
    }
    console.log(id);
    document.getElementById("movesList").value = gameToAnalyze.pgn;
    //Sending client to the board with game mode = "analyze"
    document.getElementById("profileForm").submit();
  };

  searchElement.addEventListener("input", applyFilters);
  filterElement.addEventListener("change", applyFilters);

  function applyFilters() {
    const userSearch = searchElement.value.trim().toLowerCase();
    const filter = filterElement.value;
    const filtered = history.filter((g) => {
      if (filter === "win" && g.result.toLowerCase() !== "win") return false;
      if (filter === "loss" && g.result.toLowerCase() !== "loss") return false;
      if (filter === "draw" && g.result.toLowerCase() !== "draw") return false;
      if (!userSearch) return true;
      return (
        String(g.opponent).toLowerCase().includes(userSearch) ||
        String(g.result).toLowerCase().includes(userSearch) ||
        String(g.date).toLowerCase().includes(userSearch)
      );
    });
    renderList(filtered);
  }

  await loadHistory();
})();
