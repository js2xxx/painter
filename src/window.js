const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const menu = require('./menu/mod');

let mainWindow;

function createWindow() {
      mainWindow = new BrowserWindow({
            width: 1000,
            height: 800,

            minWidth: 600,
            minHeight: 800,

            webPreferences: {
                  preload: path.join(__dirname, '../app/preload.js'),
            }
      });
      mainWindow.loadFile(path.join(__dirname, '../app/index.html'));

      mainWindow.webContents.openDevTools();

      mainWindow.on('close', (event) => {
            event.preventDefault();
            mainWindow.webContents.send('action', 'exiting');
      });
      mainWindow.on('closed', () => { mainWindow = null; });

      menu.createMenu();
}

ipcMain.on('update-title', (_event, file) => {
      if (file !== '') {
            file = file + ' - ';
      }
      mainWindow.title = file + '画图测试';
});

module.exports = {
      createWindow,
};