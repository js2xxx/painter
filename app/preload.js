const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');

const prefix = 'data:image/png;base64,';

var paint;
var fnPosition;

var currentFile = '';
var fileChanged = false;

function updateCurrentFile(file) {
      console.log(fileChanged);
      if (fileChanged) {
            var button = ipcRenderer.sendSync('save-current', currentFile);
            switch (button) {
                  case 0:
                        saveFile(currentFile === '');
                        break;
                  case 1:
                        break;
                  default: return false;
            }

            fileChanged = false;
      }
      currentFile = file;
      ipcRenderer.send('update-title', currentFile);
      return true;
}

function openFile() {
      var file = ipcRenderer.sendSync('open-dialog');
      if (file && updateCurrentFile(file[0])) {
            fs.readFile(file[0], (err, data) => {
                  if (err) {
                        console.log(err);
                  } else {
                        var base64 = data.toString('base64');
                        var url = prefix + base64;

                        var ctx = paint.getContext('2d');
                        ctx.clearRect(0, 0, paint.width, paint.height);
                        var previous = new Image();
                        previous.onload = () => {
                              paint.width = previous.width;
                              paint.height = previous.height;
                              fnPosition.innerText =
                                    paint.width.toString() + 'x' + paint.height.toString();

                              ctx.drawImage(previous, 0, 0);
                        };
                        previous.src = url;
                  }
            });
      }
}

function saveFile(saveNew) {
      var url = paint.toDataURL();
      var base64 = url.substr(prefix.length);
      var buffer = Buffer.from(base64, 'base64');

      var file = currentFile;
      if (saveNew || currentFile === '') {
            file = ipcRenderer.sendSync('save-dialog');
      }
      fs.writeFile(file, buffer, (error) => {
            if (error) {
                  console.log(error)
            }
      });
      fileChanged = false;
      updateCurrentFile(file);
}

contextBridge.exposeInMainWorld('preload', {
      setActions: function () {
            paint = document.getElementById('paint');
            fnPosition = document.getElementById('fnPosition');

            ipcRenderer.on('action', (event, arg) => {
                  switch (arg) {
                        case 'new':
                              if (updateCurrentFile('')) {
                                    var ctx = paint.getContext('2d');
                                    paint.width = 300, paint.height = 200;
                                    ctx.clearRect(0, 0, paint.width, paint.height);
                              }
                              break;

                        case 'open':
                              openFile();
                              break;

                        case 'save':
                              saveFile(false);
                              break;

                        case 'save-as':
                              saveFile(true);
                              break;

                        case 'exiting':
                              if (updateCurrentFile('')) {
                                    ipcRenderer.send('safe-exit');
                              }
                              break;
                        default:
                              break;
                  }
            });
      },

      updateChanged: function () {
            fileChanged = true;
      },
})