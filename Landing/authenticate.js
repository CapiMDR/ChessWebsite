function authenticateAccount(event) {
  event.preventDefault();
  const user = document.getElementById("user").value;
  const password = document.getElementById("password").value;

  const formData = new FormData();
  formData.append("user", user);
  formData.append("password", password);

  fetch("authenticate.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.text())
    .then((data) => {
      if (data.trim() === "valid") {
        location.assign("index.php");
      } else {
        showModal("Incorrect username or password");
      }
    })
    .catch((error) => console.error("Error:", error));
}

function showModal(msg) {
  $("#modalMsg").text(msg);
  $("#errorModal").modal("show");
}
