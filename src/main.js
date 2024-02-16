const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const prompt = require("electron-prompt");
const fetch = require("node-fetch");
const PouchDB = require("pouchdb");
const path = require("path");
const { FetchError } = require("node-fetch");

const db = new PouchDB("user_credentials");

let mainWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
});

ipcMain.handle("show-prompt", async (event, options) => {
  const result = await prompt(options);
  return result;
});

ipcMain.on("show-message-box", async (event, options) => {
  const { response, inputValue } = await dialog.showMessageBox(
    mainWindow,
    options
  );
  event.sender.send("message-box-response", { response, inputValue });
});

ipcMain.on("login", async (event, credentials) => {
  try {
    const response = await fetch(
      "http://test-demo.aemenersol.com/api/account/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      }
    );

    if (response.ok) {
      const successMessage = "Login successful!";
      const { username } = credentials;

      mainWindow.webContents.send("login-success", successMessage);
      mainWindow.webContents.send("set-username", username);

      dialog.showMessageBox(mainWindow, {
        type: "info",
        title: "Login Successful",
        message: successMessage,
        buttons: ["OK"],
      });

      mainWindow.loadFile(path.join(__dirname, "todo.html"));
    } else {
      // Simulated PouchDB validation
      const userDoc = await db.get("user_credentials");

      if (
        userDoc.username === credentials.username &&
        userDoc.password === credentials.password
      ) {
        // Credentials are valid
        const pouchDbSuccessMessage = "PouchDB validation successful!";
        mainWindow.webContents.send("login-success", pouchDbSuccessMessage);
        console.log("login-success", pouchDbSuccessMessage);

        dialog.showMessageBox(mainWindow, {
          type: "info",
          title: "PouchDB Validation Successful",
          message: pouchDbSuccessMessage,
          buttons: ["OK"],
        });

        mainWindow.loadFile(path.join(__dirname, "todo.html"));
      } else {
        // Invalid credentials
        const errorMessage = "Invalid username or password. Please try again.";
        mainWindow.webContents.send("login-failed", errorMessage);

        dialog.showMessageBox(mainWindow, {
          type: "error",
          title: "Login Failed",
          message: errorMessage,
          buttons: ["OK"],
        });
      }
    }
  } catch (error) {
    console.error("Error during login:", error);

    if (error instanceof FetchError) {
      // Network-related error
      dialog.showMessageBox(mainWindow, {
        type: "error",
        title: "Network Error",
        message:
          "An error occurred during login. Please check your internet connection and try again.",
        buttons: ["OK"],
      });
    } else {
      const errorMessage = "Invalid username or password. Please try again.";
      mainWindow.webContents.send("login-failed", errorMessage);

      dialog.showMessageBox(mainWindow, {
        type: "error",
        title: "Login Failed",
        message: errorMessage,
        buttons: ["OK"],
      });
    }
  }
});
