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
let textInput;
let tempSlider;
let startBtn;
let resetBtn;
let singleBtn;
let status;
let generating = false;

let resultText;
let temperatureText;

async function setup() {
  // Create the LSTM Generator passing it the model directory
  charRNN = ml5.charRNN('https://raw.githubusercontent.com/ml5js/ml5-data-and-models/main/models/charRNN/woolf/', modelReady);
  // Grab the DOM elements
  textInput = document.querySelector('#textInput');
  tempSlider = document.querySelector('#tempSlider');
  startBtn = document.querySelector('#start');
  resetBtn = document.querySelector('#reset');
  status = document.querySelector('#status');
  singleBtn = document.querySelector('#single');
  resultText = document.querySelector('#result')

  temperatureText = document.querySelector('#temperature');

  // DOM element events
  startBtn.addEventListener('click', generate);
  resetBtn.addEventListener('click', resetModel);
  singleBtn.addEventListener('click', predict);
  tempSlider.addEventListener('change',updateSliders);
}

setup();

// Update the slider values
function updateSliders() {
  temperatureText.innerHTML = tempSlider.value;
}

async function modelReady() {
  status.innerHTML = 'Model Loaded';
  resetModel();
}

function resetModel() {
  charRNN.reset();
  const seed = textInput.value;
  charRNN.feed(seed);
  resultText.innerHTML = seed;
}

function generate() {
  if (generating) {
    generating = false;
    startBtn.innerHTML = 'Start';
  } else {
    generating = true;
    startBtn.innerHTML = 'Pause';
    loopRNN();
  }
}

async function loopRNN() {
  while (generating) {
    await predict();
  }
}

async function predict() {
  const temperature = Number(tempSlider.value);
  const next = await charRNN.predict( Number(temperature) );
  await charRNN.feed(next.sample);
  resultText.innerHTML +=  next.sample;
}
