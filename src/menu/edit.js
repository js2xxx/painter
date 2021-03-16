const { MenuItem, Menu } = require('electron');

function createEditMenu() {
      var menu = new MenuItem({
            label: '编辑',
            // role: 'editMenu'
            submenu: Menu.buildFromTemplate(
                  [
                        {
                              label: '撤消',
                              accelerator: 'CmdOrCtrl+Z',
                              click: function (_event, focuesdWindow) {
                                    focuesdWindow.webContents.send('action', 'undo');
                              }
                        }
                  ]
            )
      });

      return menu;
}

module.exports = {
      create: createEditMenu,
}