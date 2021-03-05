const { app } = require('electron');

const window = require('./window');

app.on('ready', window.createWindow);

app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
            app.quit();
      }
});

app.on('activate', () => {
      if (mainWindow === null) {
            createWindow();
      }
});