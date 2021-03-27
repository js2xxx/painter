const fnGroup = document.querySelector('div[role="group"]');
const fnInputs = document.querySelectorAll('input[name="fn"]');

const colorStroke = document.getElementById('colorStroke');
const colorFill = document.getElementById('colorFill');

const fnPosition = document.getElementById('fnPosition');

const fnShowStroke = document.getElementById('fnShowStroke');
const fnShowStrokeEx = document.getElementById('fnShowStrokeEx');
const fnShowFill = document.getElementById('fnShowFill');
const fnShowText = document.getElementById('fnShowText');

const fnSetStroke = document.getElementById('fnSetStroke');
const fnSetStrokeThickness = document.getElementById('fnSetStrokeThickness');
const fnSetStrokeThicknessValue = document.getElementById('fnSetStrokeThicknessValue');
const fnSetFill = document.getElementById('fnSetFill');
const fnSetFontSize = document.getElementById('fnSetFontSize');

const textBox = document.getElementById('textBox');
const textPreview = document.getElementById('textPreview');

const paintContainer = document.getElementById('paintContainer');
const paintScale = document.getElementById('paintScale');
const paintScaleValue = document.getElementById('paintScaleValue');
const paintScaleReset = document.getElementById('paintScaleReset');

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

      'text': new Drawing(null, true, true, true),

      'fill': new Drawing(null, false, false, true),
};

function updateTextStyle() {
      textBox.style.color = fnSetFill.checked ? colorFill.value : colorStroke.value;
      textBox.style.fontSize = fnSetFontSize.value;
}

function updatePaintScale() {
      paintScaleValue.innerText = paintScale.value;
      paintScaleReset.style.display = paintScale.value == 100 ? 'none' : 'inline';
      var scale = paintScale.value / 100.0;
      paintContainer.style.transformOrigin = '0 0 0';
      paintContainer.style.transform = 'scale(' + scale + ')';
}

function getIndex(image, x, y) {
      return (y * image.width + x) * 4;
}

function colorHexToRGB(hex) {
      const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;

      var sColor = hex.toLowerCase();
      var sColorChange = [];
      if (sColor && reg.test(sColor)) {
            if (sColor.length === 4) {
                  var sColorNew = "#";
                  for (var i = 1; i < 4; i += 1) {
                        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
                  }
                  sColor = sColorNew;
            }

            for (var i = 1; i < 7; i += 2) {
                  sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
            }
      }
      return sColorChange;
}

function fillWithColor(startX, startY, color, alpha) {
      function isValid(image, cx, cy, oldColor) {
            var currentColor = image.data.subarray(getIndex(image, cx, cy),
                  getIndex(image, cx, cy) + 4);
            return currentColor[0] == oldColor[0] && currentColor[1] == oldColor[1]
                  && currentColor[2] == oldColor[2] && currentColor[3] == oldColor[3];
      }

      var image = ctx.getImageData(0, 0, paint.width, paint.height);
      var oldColor = image.data.slice(getIndex(image, startX, startY),
            getIndex(image, startX, startY) + 4);
      var newColor = colorHexToRGB(color);
      newColor.push(alpha * 256);
      var stack = new Array();
      stack.push([startX, startY]);
      while (stack.length > 0) {
            var pos = stack.pop();
            var x = pos[0];
            var y = pos[1];

            for (var i = 0; i < 4; i++) {
                  image.data[getIndex(image, x, y) + i] = newColor[i];
            }
            if (x > 0 && isValid(image, x - 1, y, oldColor))
                  stack.push([x - 1, y]);
            if (x < image.width - 1 && isValid(image, x + 1, y, oldColor))
                  stack.push([x + 1, y]);
            if (y > 0 && isValid(image, x, y - 1, oldColor))
                  stack.push([x, y - 1]);
            if (y < image.height - 1 && isValid(image, x, y + 1, oldColor))
                  stack.push([x, y + 1]);
      }

      ctx.putImageData(image, 0, 0);
}

textPreview.addEventListener('keydown', (event) => {
      if (event.code === 'Enter') {
            ctx.lineWidth = fnSetStrokeThickness.value;
            ctx.strokeStyle = colorStroke.value;
            ctx.fillStyle = colorFill.value;
            ctx.font = fnSetFontSize.value + ' serif';

            var left = Number(textBox.style.left.slice(0, textBox.style.left.length - 2));
            var top = Number(textBox.style.top.slice(0, textBox.style.top.length - 2));
            var fw = Number(fnSetFontSize.value.slice(0, fnSetFontSize.value.length - 2));
            if (fnSetFill.checked) {
                  ctx.fillText(textPreview.value, left - 258, top + fw - 8);
            }
            if (fnSetStroke.checked) {
                  ctx.strokeText(textPreview.value, left - 258, top + fw - 8);
            }
            textBox.style.display = 'none';
      }
});

paint.addEventListener('click', (mouse) => {
      var fn = fnGroup.querySelector('input[type="radio"]:checked').value;
      switch (fn) {
            case 'text': textBox.style.left = mouse.offsetX + 258 + 'px';
                  textBox.style.top = mouse.offsetY + 8 + 'px';
                  textBox.style.display = 'inline';
                  textPreview.value = '';
                  textPreview.focus();
                  updateTextStyle();
                  break;

            case 'fill':
                  fillWithColor(mouse.offsetX, mouse.offsetY, colorFill.value, 1.0);
                  break;
      }
});

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
            if (drawing[fn] && drawing[fn].fn) {
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
                  fnShowText.style.display = event.target.value === 'text' ? 'inline' : 'none';
            } else {
                  fnShowStroke.style.display = fnShowStrokeEx.style.display =
                        fnShowFill.style.display = fnShowText.style.display = 'none';
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
});

colorFill.addEventListener('change', (_e) => updateTextStyle());
colorStroke.addEventListener('change', (_e) => updateTextStyle());
fnSetFontSize.addEventListener('change', (_e) => updateTextStyle());

paintScale.addEventListener('mousemove', (_e) => updatePaintScale());
paintScale.addEventListener('change', (_e) => updatePaintScale());

paintScaleReset.addEventListener('click', (_e) => {
      paintScale.value = 100;
      updatePaintScale();
});

window.preload.setActions();