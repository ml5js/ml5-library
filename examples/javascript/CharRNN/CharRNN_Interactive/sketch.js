// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ML5 Example
Interactive LSTM Text Generation Example using p5.js
This uses a pre-trained model on a corpus of Virginia Woolf
For more models see: https://github.com/ml5js/ml5-data-and-training/tree/master/models/charRNN
=== */

let charRNN;
let status;
let textInput;
let tempSlider;
let lengthSlider;
let runningInference = false;

let lengthText;
let temperatureText;

let originalText;
let predictionText;

function setup() {
  // Create the LSTM Generator passing it the model directory
  charRNN = ml5.charRNN('https://raw.githubusercontent.com/ml5js/ml5-data-and-models/main/models/charRNN/woolf/', modelReady);

  // Grab the DOM elements
  textInput = document.querySelector('#textInput');
  lengthSlider = document.querySelector('#lenSlider');
  tempSlider = document.querySelector('#tempSlider');
  status = document.querySelector('#status')
  lengthText = document.querySelector('#length');
  temperatureText = document.querySelector('#temperature');
  originalText = document.querySelector('#original');
  predictionText = document.querySelector('#prediction');

  console.log(textInput)

  // Run generate anytime something changes
  textInput.addEventListener('change', generate);
  lengthSlider.addEventListener('change', generate);
  tempSlider.addEventListener('change', generate);
}

setup();

function modelReady() {
  status.innerHTML = 'Model Loaded';
}

function generate() {
  // prevent starting inference if we've already started another instance
  // TODO: is there better JS way of doing this?
  if(!runningInference) {
    runningInference = true;

    // Update the status log
    status.innerHTML = 'Generating...';

    // Update the length and temperature span elements
    lengthText.innerHTML = lengthSlider.value;
    temperatureText.innerHTML = tempSlider.value;

    // Grab the original text
    const original = textInput.value;
    // Make it to lower case
    const txt = original.toLowerCase();

    // Check if there's something
    if (txt.length > 0) {
      // Here is the data for the LSTM generator
      const data = {
        seed: txt,
        temperature: tempSlider.value,
        length: lengthSlider.value
      };

      // Generate text with the charRNN
      charRNN.generate(data, gotData);

      // Update the DOM elements with typed and generated text
      function gotData(err, result) {
        status.innerHTML = 'Ready!';
        originalText.innerHTML = original;
        predictionText.innerHTML = result.sample;
        runningInference = false;
      }
    } else {
      // Clear everything
      originalText.innerHTML = '';
      predictionText.innerHTML = '';
    }
  }
}
