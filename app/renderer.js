const fnNone = document.getElementById('fnNone');
const fnStroke = document.getElementById('fnStroke');
const fnLine = document.getElementById('fnLine');
const fnRect = document.getElementById('fnRect');
const fnCircle = document.getElementById('fnCircle');

const colorFore = document.getElementById('colorFore');
const colorBack = document.getElementById('colorBack');

const fnPosition = document.getElementById('fnPosition');

var paint = document.getElementById('paint');
var ctx = paint.getContext('2d');
var url = '';

var startX = 0;
var startY = 0;
var startAvailable = false;

function refreshImage() {
      ctx.clearRect(0, 0, paint.width, paint.height);
      var previous = new Image();
      previous.src = url;
      ctx.drawImage(previous, 0, 0);
}

paint.addEventListener('mousedown', (mouse) => {
      startX = mouse.offsetX;
      startY = mouse.offsetY;
      startAvailable = true;
      url = paint.toDataURL();
});

paint.addEventListener('mouseup', (_mouse) => {
      startAvailable = false;
      url = paint.toDataURL();
      window.preload.updateChanged();
});

paint.addEventListener('mousemove', (mouse) => {
      if (startAvailable) {
            ctx.fillStyle = colorFore.value;
            ctx.strokeStyle = colorFore.value;
            if (fnStroke.checked) {
                  ctx.beginPath();
                  ctx.moveTo(startX, startY);
                  ctx.lineTo(mouse.offsetX, mouse.offsetY);
                  ctx.stroke();

                  startX = mouse.offsetX;
                  startY = mouse.offsetY;
            } else if (fnLine.checked) {
                  refreshImage();

                  ctx.beginPath();
                  ctx.moveTo(startX, startY);
                  ctx.lineTo(mouse.offsetX, mouse.offsetY);
                  ctx.stroke();
            } else if (fnRect.checked) {
                  refreshImage();

                  ctx.beginPath();
                  ctx.moveTo(startX, startY);
                  ctx.strokeRect(startX, startY, mouse.offsetX - startX, mouse.offsetY - startY);
            } else if (fnCircle.checked) {
                  refreshImage();

                  ctx.beginPath();
                  var rx = (mouse.offsetX - startX) / 2;
                  var ry = (mouse.offsetY - startY) / 2;
                  var r = Math.sqrt(rx * rx + ry * ry);
                  ctx.arc(rx + startX, ry + startY, r, 0, Math.PI * 2);
                  ctx.stroke();
            }
      }
});

var tmpStartX = 0, tmpEndX = 0;
var tmpHeight = 0, tmpEndY = 0;
var settingSize = false;
fnPosition.addEventListener('mousedown', (mouse) => {
      tmpStartX = mouse.offsetX;
      tmpStartY = mouse.offsetY;
      url = paint.toDataURL();
      settingSize = true;
});

fnPosition.addEventListener('mouseup', (mouse) => {
      url = paint.toDataURL();
      settingSize = false;
})

fnPosition.addEventListener('mousemove', (mouse) => {
      if (settingSize) {
            tmpEndX = mouse.offsetX;
            tmpEndY = mouse.offsetY;

            var deltaWidth = tmpEndX - tmpStartX;
            var deltaHeight = tmpEndY - tmpStartY;

            paint.width += deltaWidth;
            paint.height += deltaHeight;
            refreshImage();

            fnPosition.innerText = paint.width.toString() + 'x' + paint.height.toString();
      }
})

window.preload.setActions();