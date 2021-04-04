const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');

const prefix = 'data:image/png;base64,';

var paint;
var fnPosition;

var currentFile = '';
var url = [''];
var imgData = [];
var width = [0], height = [0];
var urlIndex = 1;
var fileChanged = false;

function updateCurrentFile(file) {
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
                        var newUrl = prefix + base64;

                        var ctx = paint.getContext('2d');
                        ctx.clearRect(0, 0, paint.width, paint.height);
                        var imgCache = new Image();
                        imgCache.onload = () => {
                              paint.width = imgCache.width;
                              paint.height = imgCache.height;
                              fnPosition.innerText =
                                    paint.width.toString() + 'x' + paint.height.toString();

                              ctx.drawImage(imgCache, 0, 0);
                        };
                        imgCache.src = newUrl;
                        url = [newUrl];
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
      fs.writeFile(file, buffer, (err) => {
            if (err) {
                  console.log(err)
            }
      });
      fileChanged = false;
      updateCurrentFile(file);
}

function refreshImage() {
      var ctx = paint.getContext('2d');
      ctx.clearRect(0, 0, paint.width, paint.height);
      var curImage = getCurrentHistory();
      if (curImage !== undefined) {
            ctx.putImageData(curImage, 0, 0);
      }
}

function addHistory(newUrl, newImgData, w, h) {
      if (urlIndex > 1) {
            url = url.slice(0, url.length - urlIndex + 1);
            imgData = imgData.slice(0, imgData.length - urlIndex + 1);
            width = width.slice(0, width.length - urlIndex + 1);
            height = height.slice(0, height.length - urlIndex + 1);
            urlIndex = 1;
      }
      url.push(newUrl);
      imgData.push(newImgData);
      width.push(w);
      height.push(h);
}

function setCurrentHistory(currentUrl, currentImgData, w, h) {
      url[url.length - urlIndex] = currentUrl;
      imgData[imgData.length - urlIndex] = currentImgData;
      width[width.length - urlIndex] = w;
      height[height.length - urlIndex] = h;
}

function getCurrentHistory() {
      return new ImageData(imgData[imgData.length - urlIndex].data,
            width[width.length - urlIndex],
            height[height.length - urlIndex]);
}

contextBridge.exposeInMainWorld('preload', {
      setActions: function () {
            paint = document.getElementById('paint');
            fnPosition = document.getElementById('fnPosition');

            ipcRenderer.on('action', (_event, arg) => {
                  switch (arg) {
                        case 'new':
                              if (updateCurrentFile('')) {
                                    var ctx = paint.getContext('2d');
                                    paint.width = 300, paint.height = 200;
                                    ctx.clearRect(0, 0, paint.width, paint.height);
                                    url = [''];
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

                        case 'undo':
                              if (urlIndex < url.length) {
                                    urlIndex += 1;
                                    refreshImage(false);
                              }
                              break;

                        case 'redo':
                              if (urlIndex > 1) {
                                    urlIndex -= 1;
                                    refreshImage(false);
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

      addHistory,
      refreshImage,
      setCurrentHistory,
})