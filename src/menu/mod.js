const { Menu } = require('electron');

const fileMenu = require('./file');

function createMenu() {
      var menu = new Menu();

      menu.append(fileMenu.create());

      Menu.setApplicationMenu(menu);
}

module.exports = {
      createMenu,
}