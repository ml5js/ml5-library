// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint max-len: ["error", { "code": 180 }] */

function map(num, inmin, inmax) {
  return ((num - inmin) * 360) / (inmax - inmin);
}
function hsl(num, min, max) {
  return `hsla(${map(num, min, max)}, 100%, 50%,1)`;
}
function drawObject(item, ctx, color) {
  const txt = `${item.label} : ${(item.score * 100).toFixed(2)}%`;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.rect(item.x, item.y, item.w, item.h);
  ctx.stroke();
  ctx.fillStyle = color;
  if (item.y - 25 >= 0) {
    // text box on top
    ctx.fillRect(item.x - 1.5, item.y - 1.5, 90, -15);
    ctx.fillStyle = '#000000';
    ctx.fillText(txt, item.x, item.y - 5);
  } else {
    // text box Inside
    ctx.fillRect(item.x - 1.5, item.y - 1.5, 90, 20);
    ctx.fillStyle = '#000000';
    ctx.fillText(txt, item.x, item.y + 12);
  }
}
function draw(detections, ctx, labelsLength) {
  ctx.lineWidth = 1.5;
  ctx.font = '13px Segoe UI';
  detections.forEach((det) => {
    const color = hsl(det.labelIndex, 0, labelsLength);
    drawObject(det, ctx, color);
  });
}

export default draw;
