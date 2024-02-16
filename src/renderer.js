const { ipcRenderer } = require("electron");

function login() {
  console.log("Login button clicked");
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    const errorMessage = "Please enter both username and password.";
    ipcRenderer.send("show-message-box", {
      type: "error",
      title: "Input Validation Error",
      message: errorMessage,
      buttons: ["OK"],
    });
    return;
  }

  ipcRenderer.send("login", { username, password });
}
