function authenticateAccount(event){
  event.preventDefault();
  const user = document.getElementById("user").value;
  const password = document.getElementById("password").value;

  const formData = new FormData();
  formData.append("user", user);
  formData.append("password", password);

  fetch("authenticate.php", {
    method: "POST",
    body: formData,
    credentials: "same-origin" // <- importante: permite cookies de sesión
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok: " + response.status);
      return response.text();
    })
    .then((data) => {
      const res = data.trim();
      if (res === "valid") {
        //redirige al índice; cambia la ruta si necesitas otra
        location.assign("index.php");
      } else {
        showModal("Incorrect username or password");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showModal("Error de conexión, revisa consola");
    });
}

function showModal(msg) {
  $("#modalMsg").text(msg);
  $("#errorModal").modal("show");
}