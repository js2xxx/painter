const { Menu, MenuItem, dialog } = require('electron');

const fileMenu = require('./file');
const editMenu = require('./edit');

function createMenu() {
      var menu = new Menu();

      menu.append(fileMenu.create());
      menu.append(editMenu.create());

      var helpMenu = new MenuItem({
            label: '帮助',
            submenu: Menu.buildFromTemplate([
                  {
                        label: '关于',
                        accelerator: 'F1',
                        click: function (_event, _focusedWindow) {
                              dialog.showMessageBox(_focusedWindow, {
                                    title: 'Painter',
                                    message: 'An example of painter written with Electron\nAuthor: @Js2xxx (github)',
                                    buttons: ['确定'],
                              });
                        }
                  }
            ])
      });
      menu.append(helpMenu);

      Menu.setApplicationMenu(menu);
}

module.exports = {
      createMenu,
}