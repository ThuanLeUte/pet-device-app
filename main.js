// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("path");
const { Title_btn_ipc_handler } = require("./src/ipc_main.js");

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 810,
    height: 500,
    minWidth: 810,
    minHeight: 450,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("view/main_view.html");

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  //   //Ipc_handler
  Title_btn_ipc_handler(mainWindow);
  //   Com_port_ipc_handler(mainWindow);
  //   Save_log();
  //   Error_msg_ipc_handler();

  //mainWindows event
  mainWindow.on("maximize", () => {
    mainWindow.webContents.send("isMaximized");
  });
  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("isRestored");
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
