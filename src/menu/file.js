const { MenuItem, ipcMain, dialog, BrowserWindow, app } = require('electron');
const path = require('path');

function createFileMenu() {
      var menu = new MenuItem({
            label: '文件',
            role: 'fileMenu',
      });
      menu.submenu.append(new MenuItem({
            label: '打开',
            accelerator: 'CmdOrCtrl+O',
            click: function (_event, focusedWindow) {
                  focusedWindow.webContents.send('action', 'open');
            }
      }));
      menu.submenu.append(new MenuItem({
            label: '保存',
            accelerator: 'CmdOrCtrl+S',
            click: function (_event, focusedWindow) {
                  focusedWindow.webContents.send('action', 'save');
            }
      }));
      menu.submenu.append(new MenuItem({
            label: '另存为',
            accelerator: 'CmdOrCtrl+Shift+S',
            click: function (_event, focusedWindow) {
                  focusedWindow.webContents.send('action', 'save-as');
            }
      }));
      return menu;
}

ipcMain.on('save-dialog', (event) => {
      event.returnValue = dialog.showSaveDialogSync(BrowserWindow.getFocusedWindow(), {
            defaultPath: path.join(app.getPath('documents'), 'Untitled.png'),
            filters: [{ name: 'PNG 文件', extensions: ['png'] }]
      });
});

ipcMain.on('open-dialog', (event) => {
      event.returnValue = dialog.showOpenDialogSync(BrowserWindow.getFocusedWindow(), {
            defaultPath: app.getPath('documents'),
            filters: [{ name: 'PNG 文件', extensions: ['png'] }]
      });
});

module.exports = {
      create: createFileMenu,
}