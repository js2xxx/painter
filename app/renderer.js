//#region DOM elements except PAINT

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

const selectBox = document.getElementById('selectBox');
const paintSelectReset = document.getElementById('paintSelectReset');
const paintSelectCancel = document.getElementById('paintSelectCancel');

//#endregion

//#region Global variables

var paint = document.getElementById('paint');
var ctx = paint.getContext('2d');

var startX = 0;
var startY = 0;
var startAvailable = false;

var paintSelected = false;
var selection = null;
var selectionX = -1, selectionY = -1, selectionW = -1, selectionH = -1;
var moved = false;

//#endregion

//#region Drawing class & functions

class Drawing {
      constructor(fn, stroke, strokeEx, fill) {
            this.fn = fn;
            this.stroke = stroke;
            this.strokeEx = strokeEx;
            this.fill = fill;
      }
}

var drawing = {
      'select': new Drawing(function (mouse) {
            if (!paintSelected) {
                  selectBox.style.display = 'inline';
                  selectBox.style.left = startX + 'px';
                  selectBox.style.top = startY + 'px';
                  selectBox.style.width = mouse.offsetX - startX + 'px';
                  selectBox.style.height = mouse.offsetY - startY + 'px';
            }
      }, false, false, false),

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
            window.preload.refreshImage();

            ctx.lineWidth = fnSetStrokeThickness.value;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(mouse.offsetX, mouse.offsetY);
            ctx.stroke();
      }, true, true, false),

      'rect': new Drawing(function (mouse) {
            window.preload.refreshImage();

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
            window.preload.refreshImage();

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

      'ellipse': new Drawing(function (mouse) {
            window.preload.refreshImage();

            if (fnSetStroke.checked) {
                  ctx.lineWidth = fnSetStrokeThickness.value;
            } else {
                  ctx.lineWidth = 0;
            }

            ctx.beginPath();
            var rx = (mouse.offsetX - startX) / 2;
            var ry = (mouse.offsetY - startY) / 2;
            ctx.ellipse(startX + rx, startY + ry, rx, ry, 0, 0, Math.PI * 2);
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

//#endregion

//#region Utility functions

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

function fillWithColor(startX, startY, color, alpha) {
      function isValid(image, cx, cy, oldColor) {
            var currentColor = image.data.subarray(getIndex(image, cx, cy),
                  getIndex(image, cx, cy) + 4);
            return currentColor[0] == oldColor[0] && currentColor[1] == oldColor[1]
                  && currentColor[2] == oldColor[2] && currentColor[3] == oldColor[3];
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

function resetSelection() {
      paintSelected = false;
      paintSelectReset.style.display = 'none';
      paintSelectReset.innerText = '删除区域';
      paintSelectCancel.style.display = 'none';
      selectBox.style.display = 'none';
      selection = null;
      selectionX = selectionY = selectionW = selectionH = -1;
}

//#endregion

//#region Event handlers: texting

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
                  ctx.fillText(textPreview.value, left, top + fw);
            }
            if (fnSetStroke.checked) {
                  ctx.strokeText(textPreview.value, left, top + fw);
            }
            textBox.style.display = 'none';
      }
});

//#endregion

//#region Event handlers: general painting

paint.addEventListener('click', (mouse) => {
      var fn = fnGroup.querySelector('input[type="radio"]:checked').value;
      switch (fn) {
            case 'text':
                  textBox.style.left = mouse.offsetX + 'px';
                  textBox.style.top = mouse.offsetY + 'px';
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

      window.preload.setCurrentHistory(paint.toDataURL(),
            ctx.getImageData(0, 0, paint.width, paint.height), paint.width, paint.height);
});

paint.addEventListener('mouseup', (_mouse) => {
      if (startAvailable) {
            startAvailable = false;
            window.preload.addHistory(paint.toDataURL(),
                  ctx.getImageData(0, 0, paint.width, paint.height), paint.width, paint.height);
            window.preload.updateChanged();
      }

      var fn = fnGroup.querySelector('input[type="radio"]:checked').value;
      switch (fn) {
            case 'select':
                  if (!paintSelected) {
                        paintSelected = true;

                        paintSelectReset.style.display = 'inline';
                        paintSelectCancel.style.display = 'inline';

                        selectionX = selectBox.offsetLeft;
                        selectionY = selectBox.offsetTop;
                        selectionW = selectBox.clientWidth;
                        selectionH = selectBox.clientHeight;

                        selection = ctx.getImageData(selectionX, selectionY,
                              selectionW, selectionH);
                  }
                  break;
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

//#endregion

//#region Event handlers: sizing

var tmpStartX = 0, tmpEndX = 0;
var tmpHeight = 0, tmpEndY = 0;
var settingSize = false;
fnPosition.addEventListener('mousedown', (mouse) => {
      tmpStartX = mouse.offsetX;
      tmpStartY = mouse.offsetY;
      window.preload.setCurrentHistory(paint.toDataURL(),
            ctx.getImageData(0, 0, paint.width, paint.height), paint.width, paint.height);
      settingSize = true;
});

fnPosition.addEventListener('mouseup', (_mouse) => {
      if (settingSize) {
            settingSize = false;
            window.preload.addHistory(paint.toDataURL(),
                  ctx.getImageData(0, 0, paint.width, paint.height), paint.width, paint.height);
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
            window.preload.refreshImage();

            fnPosition.innerText = paint.width.toString() + 'x' + paint.height.toString();
      }
});

//#endregion

//#region Event handlers: controlling visibility of UI controls

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

//#endregion

//#region Event handlers: setting styles & scaling

colorFill.addEventListener('change', (_e) => updateTextStyle());
colorStroke.addEventListener('change', (_e) => updateTextStyle());
fnSetFontSize.addEventListener('change', (_e) => updateTextStyle());

paintScale.addEventListener('mousemove', (_e) => updatePaintScale());
paintScale.addEventListener('change', (_e) => updatePaintScale());

paintScaleReset.addEventListener('click', (_e) => {
      paintScale.value = 100;
      updatePaintScale();
});

//#endregion

//#region Event handlers: moving & erasing the selection

selectBox.addEventListener('mousedown', (mouse) => {
      startX = mouse.offsetX;
      startY = mouse.offsetY;
      startAvailable = true;
});

selectBox.addEventListener('mousemove', (mouse) => {
      if (startAvailable) {
            window.preload.refreshImage();
            var newLeft = selectBox.offsetLeft + mouse.offsetX - startX;
            var newTop = selectBox.offsetTop + mouse.offsetY - startY;

            selectBox.style.left = newLeft + 'px';
            selectBox.style.top = newTop + 'px';

            if (selection != null) {
                  ctx.clearRect(selectionX, selectionY, selectionW, selectionH);
                  ctx.putImageData(selection, newLeft, newTop);
                  moved = true;
            }
      }
});

selectBox.addEventListener('mouseup', (_mouse) => {
      if (startAvailable) {
            startAvailable = false;
            if (selection != null) {
                  ctx.clearRect(selectionX, selectionY, selectionW, selectionH);
            }
      }
      if (moved) {
            paintSelectReset.innerText = '确定';
            moved = false;
      }
});

paintSelectCancel.addEventListener('click', (_e) => {
      window.preload.refreshImage();
      resetSelection();
});

paintSelectReset.addEventListener('click', (_e) => {
      ctx.clearRect(selectionX, selectionY, selectionW, selectionH);
      window.preload.addHistory(paint.toDataURL(),
            ctx.getImageData(0, 0, paint.width, paint.height), paint.width, paint.height);
      window.preload.updateChanged();

      resetSelection();
});

//#endregion

window.preload.setActions();