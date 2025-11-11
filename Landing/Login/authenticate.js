function authenticateAccount(event) {
  event.preventDefault();

  fetch("authenticate.php", {
    method: "POST",
    body: new FormData(document.getElementById("loginForm")),
    credentials: "same-origin",
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok: " + response.status);
      return response.text();
    })
    .then((data) => {
      const res = data.trim();
      if (res === "valid") {
        location.assign("../index.php");
      } else {
        showModal("Incorrect username or password");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showModal("Connection error");
    });
}
