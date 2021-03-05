const fn_none = document.getElementById('fn_none');
const fn_line = document.getElementById('fn_line');
const fn_rect = document.getElementById('fn_rect');
const fn_circle = document.getElementById('fn_circle');

var paint = document.getElementById('paint');
var ctx = paint.getContext('2d');
var url = '';

var start_x = 0;
var start_y = 0;
var start_available = false;

function refresh_image() {
      ctx.clearRect(0, 0, paint.width, paint.height);
      var previous = new Image();
      previous.src = url;
      ctx.drawImage(previous, 0, 0);
}

paint.addEventListener('mousedown', (mouse) => {
      start_x = mouse.offsetX;
      start_y = mouse.offsetY;
      start_available = true;
      url = paint.toDataURL();
});

paint.addEventListener('mouseup', (_mouse) => {
      start_available = false;
      url = paint.toDataURL();
});

paint.addEventListener('mousemove', (mouse) => {
      if (start_available) {
            if (fn_line.checked) {
                  refresh_image();

                  ctx.beginPath();
                  ctx.moveTo(start_x, start_y);
                  ctx.lineTo(mouse.offsetX, mouse.offsetY);
                  ctx.stroke();
            } else if (fn_rect.checked) {
                  refresh_image();

                  ctx.beginPath();
                  ctx.moveTo(start_x, start_y);
                  ctx.strokeRect(start_x, start_y, mouse.offsetX - start_x, mouse.offsetY - start_y);
            } else if (fn_circle.checked) {
                  refresh_image();

                  ctx.beginPath();
                  var rx = (mouse.offsetX - start_x) / 2;
                  var ry = (mouse.offsetY - start_y) / 2;
                  var r = Math.sqrt(rx * rx + ry * ry);
                  ctx.arc(rx + start_x, ry + start_y, r, 0, Math.PI * 2);
                  ctx.stroke();
            }
      }
});

window.preload.setActions();