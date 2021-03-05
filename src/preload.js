const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');

const prefix = 'data:image/png;base64,';

var currentFile = '';

function updateCurrentFile(file) {
      currentFile = file;
      ipcRenderer.send('update-title', currentFile);
}

function openFile(paint) {
      var file = ipcRenderer.sendSync('open-dialog');
      if (file) {
            updateCurrentFile(file[0]);
            fs.readFile(file[0], (err, data) => {
                  if (err) {
                        console.log(err);
                  } else {
                        var base64 = data.toString('base64');
                        var new_url = prefix + base64;

                        var ctx = paint.getContext('2d');
                        ctx.clearRect(0, 0, paint.width, paint.height);
                        var previous = new Image();
                        previous.src = new_url;
                        previous.onload = () => ctx.drawImage(previous, 0, 0);
                  }
            });
      }
}

function saveFile(paint, saveNew) {
      var url = paint.toDataURL();
      var base64 = url.substr(prefix.length);
      var buffer = Buffer.from(base64, 'base64');

      var file = currentFile;
      if(saveNew || currentFile === '') {
            file = ipcRenderer.sendSync('save-dialog');
      }
      fs.writeFile(file, buffer, (error) => {
            if (error) {
                  console.log(error)
            }
      });
      updateCurrentFile(file);
}

contextBridge.exposeInMainWorld('preload', {
      setActions: function () {
            ipcRenderer.on('action', (event, arg) => {
                  var paint = document.getElementById('paint');

                  switch (arg) {
                        case 'open':
                              openFile(paint);
                              break;

                        case 'save':
                              saveFile(paint, false);
                              break;

                        case 'save-as':
                              saveFile(paint, true);
                              break;
                        default:
                              break;
                  }
            });
      }
})