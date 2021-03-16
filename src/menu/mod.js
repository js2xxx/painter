const { Menu } = require('electron');

const fileMenu = require('./file');
const editMenu = require('./edit');

function createMenu() {
      var menu = new Menu();

      menu.append(fileMenu.create());
      menu.append(editMenu.create());

      Menu.setApplicationMenu(menu);
}

module.exports = {
      createMenu,
}