const { BrowserWindow, ipcMain, dialog } = require("electron");
// const SerialPort = require("serialport");
const fs = require("fs");
const ipc = ipcMain;
const delay = (ms) => new Promise((_) => setTimeout(_, ms));

module.exports = {
  Title_btn_ipc_handler,
};

function Title_btn_ipc_handler(mainWindow) {
  ipc.on("minimizeApp", () => {
    mainWindow.minimize();
  });
  ipc.on("maxResApp", () => {
    if (mainWindow.isMaximized()) mainWindow.restore();
    else mainWindow.maximize();
  });
  ipc.on("closeApp", () => {
    mainWindow.close();
  });
}
