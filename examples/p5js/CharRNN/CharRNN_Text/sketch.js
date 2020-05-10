// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
LSTM Generator example with p5.js
This uses a pre-trained model on a corpus of Virginia Woolf
For more models see: https://github.com/ml5js/ml5-data-and-training/tree/master/models/charRNN
=== */

let charRNN;
let textInput;
let lengthSlider;
let tempSlider;
let button;
let runningInference = false;

function setup() {
  noCanvas();

  // Create the LSTM Generator passing it the model directory
  charRNN = ml5.charRNN('./models/woolf/', modelReady);

  // Grab the DOM elements
  textInput = select('#textInput');
  lengthSlider = select('#lenSlider');
  tempSlider = select('#tempSlider');
  button = select('#generate');

  // DOM element events
  button.mousePressed(generate);
  lengthSlider.input(updateSliders);
  tempSlider.input(updateSliders);
}

// Update the slider values
function updateSliders() {
  select('#length').html(lengthSlider.value());
  select('#temperature').html(tempSlider.value());
}

function modelReady() {
  select('#status').html('Model Loaded');
}

// Generate new text
function generate() {
  // prevent starting inference if we've already started another instance
  // TODO: is there better JS way of doing this?
  if(!runningInference) {
    runningInference = true;

    // Update the status log
    select('#status').html('Generating...');

    // Grab the original text
    const original = textInput.value();
    // Make it to lower case
    const txt = original.toLowerCase();

    // Check if there's something to send
    if (txt.length > 0) {
      // This is what the LSTM generator needs
      // Seed text, temperature, length to outputs
      // TODO: What are the defaults?
      const data = {
        seed: txt,
        temperature: tempSlider.value(),
        length: lengthSlider.value()
      };

      // Generate text with the charRNN
      charRNN.generate(data, gotData);

      // When it's done
      function gotData(err, result) {
        // Update the status log
        select('#status').html('Ready!');
        select('#result').html(txt + result.sample);
        runningInference = false;
      }
    }
  }
}
