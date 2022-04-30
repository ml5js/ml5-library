// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Stateful LSTM Text Generation Example using p5.js
This uses a pre-trained model on a corpus of Virginia Woolf
For more models see: https://github.com/ml5js/ml5-data-and-training/tree/master/models/lstm
=== */

let charRNN;
let tempSlider;
let generating = false;

const canvasHeight = 100;

function setup() {
  noCanvas();
  // Create the LSTM Generator passing it the model directory
  charRNN = ml5.charRNN('https://raw.githubusercontent.com/ml5js/ml5-data-and-models/main/models/charRNN/woolf/', modelReady);
  // Grab the DOM elements
  tempSlider = select('#tempSlider');

  // DOM element events
  select('#start').mousePressed(generate);
  select('#reset').mousePressed(resetModel);
  select('#single').mousePressed(predict);
  tempSlider.input(updateSliders);
}

function windowResized() {
  resizeCanvas(windowWidth, canvasHeight);
}

// Update the slider values
function updateSliders() {
  select('#temperature').html(tempSlider.value());
}

async function modelReady() {
  select('#status').html('Model Loaded');
  resetModel();
}

function resetModel() {
  charRNN.reset();
  const seed = select('#textInput').value();
  charRNN.feed(seed);
  select('#result').html(seed);
}

function generate() {
  if (generating) {
    generating = false;
    select('#start').html('Start');
  } else {
    generating = true;
    select('#start').html('Pause');
    loopRNN();
  }
}

async function loopRNN() {
  while (generating) {
    await predict();
  }
}

async function predict() {
  const par = select('#result');
  const temperature = tempSlider.value();
  const next = await charRNN.predict(temperature);
  await charRNN.feed(next.sample);
  par.html(par.html() + next.sample);
}
