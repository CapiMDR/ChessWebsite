function registerAccount(event) {
  event.preventDefault();

  fetch("./register_user.php", {
    method: "POST",
    body: new FormData(document.getElementById("registerForm")),
    credentials: "same-origin",
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok: " + response.status);
      return response;
    })
    .then((response) => response.json())
    .then((data) => {
      showModal(data.message);
    })
    .catch((error) => {
      console.error("Error:", error);
      showModal("Connection error");
    });
}
