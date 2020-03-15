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
let previous_pen = 'down';
// Current location of drawing
let x, y;
// The current "stroke" of the drawing
let strokePath;
let seedStrokes = [];

// Storing a reference to the canvas
let canvas;

function setup() {
  canvas = createCanvas(640, 480);
  // Hide the canvas until the model is ready
  canvas.hide();

  background(220);
  // Load the model
  // See a list of all supported models: https://github.com/ml5js/ml5-library/blob/master/src/SketchRNN/models.js
  model = ml5.sketchRNN('cat', modelReady);

  // Button to start drawing
  let button = select('#clear');
  button.mousePressed(clearDrawing);
}

// The model is ready
function modelReady() {
  canvas.show();
  // sketchRNN will begin when the mouse is released
  canvas.mouseReleased(startSketchRNN);
  select('#status').html('model ready - sketchRNN will begin after you draw with the mouse');
}

// Reset the drawing
function clearDrawing() {
  background(220);
  // clear seed strokes
  seedStrokes = [];
  // Reset model
  model.reset();
}

// sketchRNN takes over
function startSketchRNN() {
  // Start where the mouse left off
  x = mouseX;
  y = mouseY;
  // Generate with the seedStrokes
  model.generate(seedStrokes, gotStroke);
}

function draw() {
  // If the mosue is pressed capture the user strokes 
  if (mouseIsPressed) {
    // Draw line
    stroke(0);
    strokeWeight(3.0);
    line(pmouseX, pmouseY, mouseX, mouseY);
    // Create a "stroke path" with dx, dy, and pen
    let userStroke = {
      dx: mouseX - pmouseX,
      dy: mouseY - pmouseY,
      pen: 'down'
    };
    // Add to the array
    seedStrokes.push(userStroke);
  }

  // If something new to draw
  if (strokePath) {
    // If the pen is down, draw a line
    if (previous_pen == 'down') {
      stroke(0);
      strokeWeight(3.0);
      line(x, y, x + strokePath.dx, y + strokePath.dy);
    }
    // Move the pen
    x += strokePath.dx;
    y += strokePath.dy;
    // The pen state actually refers to the next stroke
    previous_pen = strokePath.pen;

    // If the drawing is complete
    if (strokePath.pen !== 'end') {
      strokePath = null;
      model.generate(gotStroke);
    }
  }
}

// A new stroke path
function gotStroke(err, s) {
  strokePath = s;
}