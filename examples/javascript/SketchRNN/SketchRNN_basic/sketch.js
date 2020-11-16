// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
SketchRNN
=== */

// The SketchRNN model
let model;
// Start by drawing
let previousPen = "down";
// Current location of drawing
let x, y;
// The current "stroke" of the drawing
let strokePath;
let button;

let canvas, ctx;

const width = 640;
const height = 480;

async function setup() {
  canvas = createCanvas(640, 480);
  ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ebedef";
  ctx.fillRect(0, 0, width, height);

  // See a list of all supported models: https://github.com/ml5js/ml5-library/blob/master/src/SketchRNN/models.js
  model = await ml5.sketchRNN("cat");

  // Button to reset drawing
  button = document.querySelector("#clearBtn");
  button.addEventListener("click", startDrawing);

  // run sketchRNN
  startDrawing();

  requestAnimationFrame(draw);
}
setup();

function modelReady() {
  console.log("model loaded");
  startDrawing();
}

// Reset the drawing
function startDrawing() {
  clearCanvas();
  // Start in the middle
  x = width / 2;
  y = height / 2;
  model.reset();
  // Generate the first stroke path
  model.generate(gotStroke);
}

function draw() {
  requestAnimationFrame(draw);
  // If something new to draw
  if (strokePath) {
    // If the pen is down, draw a line
    if (previousPen === "down") {
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.moveTo(x, y);
      ctx.lineTo(x + strokePath.dx, y + strokePath.dy);
      ctx.stroke();
    }
    // Move the pen
    x += strokePath.dx;
    y += strokePath.dy;
    // The pen state actually refers to the next stroke
    previousPen = strokePath.pen;

    // If the drawing is complete
    if (strokePath.pen !== "end") {
      strokePath = null;
      model.generate(gotStroke);
    }
  }
}

// A new stroke path
function gotStroke(err, s) {
  strokePath = s;
}

function clearCanvas() {
  ctx.fillStyle = "#ebedef";
  ctx.fillRect(0, 0, width, height);
}

function createCanvas(w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  document.body.appendChild(canvas);
  return canvas;
}
