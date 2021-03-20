const fnGroup = document.querySelector('div[role="group"]');
const fnInputs = document.querySelectorAll('input[name="fn"]');

const colorStroke = document.getElementById('colorStroke');
const colorFill = document.getElementById('colorFill');

const fnPosition = document.getElementById('fnPosition');

const fnShowStroke = document.getElementById('fnShowStroke');
const fnShowStrokeEx = document.getElementById('fnShowStrokeEx');
const fnShowFill = document.getElementById('fnShowFill');

const fnSetStroke = document.getElementById('fnSetStroke');
const fnSetStrokeThickness = document.getElementById('fnSetStrokeThickness');
const fnSetStrokeThicknessValue = document.getElementById('fnSetStrokeThicknessValue');
const fnSetFill = document.getElementById('fnSetFill');

var paint = document.getElementById('paint');
var ctx = paint.getContext('2d');

var startX = 0;
var startY = 0;
var startAvailable = false;

class Drawing {
      constructor(fn, stroke, strokeEx, fill) {
            this.fn = fn;
            this.stroke = stroke;
            this.strokeEx = strokeEx;
            this.fill = fill;
      }
}

var drawing = {
      'stroke': new Drawing(function (mouse) {
            ctx.lineWidth = fnSetStrokeThickness.value;
            ctx.save();
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(mouse.offsetX, mouse.offsetY);
            ctx.stroke();

            ctx.restore();
            startX = mouse.offsetX;
            startY = mouse.offsetY;
      }, true, true, false),
      'eraser': new Drawing(function (mouse) {
            ctx.lineWidth = fnSetStrokeThickness.value;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(mouse.offsetX, mouse.offsetY);
            ctx.stroke();

            ctx.restore();
            startX = mouse.offsetX;
            startY = mouse.offsetY;
      }, true, false, false),
      'line': new Drawing(function (mouse) {
            window.preload.refreshImage(true);

            ctx.lineWidth = fnSetStrokeThickness.value;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(mouse.offsetX, mouse.offsetY);
            ctx.stroke();
      }, true, true, false),
      'rect': new Drawing(function (mouse) {
            window.preload.refreshImage(true);

            if (fnSetStroke.checked) {
                  ctx.lineWidth = fnSetStrokeThickness.value;
            } else {
                  ctx.lineWidth = 0;
            }

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            if (fnSetStroke.checked) {
                  ctx.strokeRect(startX, startY, mouse.offsetX - startX, mouse.offsetY - startY);
            }
            if (fnSetFill.checked) {
                  ctx.fillRect(startX, startY, mouse.offsetX - startX, mouse.offsetY - startY);
            }
      }, true, true, true),
      'circle': new Drawing(function (mouse) {
            window.preload.refreshImage(true);

            if (fnSetStroke.checked) {
                  ctx.lineWidth = fnSetStrokeThickness.value;
            } else {
                  ctx.lineWidth = 0;
            }

            ctx.beginPath();
            var rx = (mouse.offsetX - startX) / 2;
            var ry = (mouse.offsetY - startY) / 2;
            var r = Math.sqrt(rx * rx + ry * ry);
            ctx.arc(rx + startX, ry + startY, r, 0, Math.PI * 2);
            if (fnSetStroke.checked) {
                  ctx.stroke();
            }
            if (fnSetFill.checked) {
                  ctx.fill();
            }
      }, true, true, true),
};

paint.addEventListener('mousedown', (mouse) => {
      startX = mouse.offsetX;
      startY = mouse.offsetY;
      startAvailable = true;
      window.preload.setCurrentHistory(paint.toDataURL());
});

paint.addEventListener('mouseup', (_mouse) => {
      if (startAvailable) {
            startAvailable = false;
            window.preload.addHistory(paint.toDataURL());
            window.preload.updateChanged();
      }
});

paint.addEventListener('mousemove', (mouse) => {
      if (startAvailable) {
            ctx.fillStyle = colorFill.value;
            ctx.strokeStyle = colorStroke.value;
            var fn = fnGroup.querySelector('input[type="radio"]:checked').value;
            if (drawing[fn]) {
                  drawing[fn].fn(mouse);
            }
      }
});

var tmpStartX = 0, tmpEndX = 0;
var tmpHeight = 0, tmpEndY = 0;
var settingSize = false;
fnPosition.addEventListener('mousedown', (mouse) => {
      tmpStartX = mouse.offsetX;
      tmpStartY = mouse.offsetY;
      window.preload.setCurrentHistory(paint.toDataURL());
      settingSize = true;
});

fnPosition.addEventListener('mouseup', (mouse) => {
      if (settingSize) {
            settingSize = false;
            window.preload.addHistory(paint.toDataURL());
            window.preload.updateChanged();
      }
});

fnPosition.addEventListener('mousemove', (mouse) => {
      if (settingSize) {
            tmpEndX = mouse.offsetX;
            tmpEndY = mouse.offsetY;

            var deltaWidth = tmpEndX - tmpStartX;
            var deltaHeight = tmpEndY - tmpStartY;

            paint.width += deltaWidth;
            paint.height += deltaHeight;
            window.preload.refreshImage(true);

            fnPosition.innerText = paint.width.toString() + 'x' + paint.height.toString();
      }
});

fnInputs.forEach((value, _key, _parent) => {
      value.addEventListener('change', (event) => {
            console.log(event.target.value);
            if (drawing[event.target.value]) {
                  fnShowStroke.style.display = drawing[event.target.value].stroke ? 'inline' : 'none';
                  fnShowStrokeEx.style.display = drawing[event.target.value].strokeEx ? 'inline' : 'none';
                  fnShowFill.style.display = drawing[event.target.value].fill ? 'inline' : 'none';
            } else {
                  fnShowStroke.style.display = fnShowStrokeEx.style.display =
                        fnShowFill.style.display = 'none';
            }
      })
});

fnSetStroke.addEventListener('change', (_e) => {
      colorStroke.disabled = fnSetStrokeThickness.disabled = !fnSetStroke.checked;
});

fnSetStrokeThickness.addEventListener('mousemove', (_ev) => {
      fnSetStrokeThicknessValue.innerText = fnSetStrokeThickness.value;
});

fnSetStrokeThickness.addEventListener('mousedown', (_ev) => {
      fnSetStrokeThicknessValue.innerText = fnSetStrokeThickness.value;
});

fnSetFill.addEventListener('change', (_e) => {
      colorFill.disabled = !fnSetFill.checked;
})

window.preload.setActions();