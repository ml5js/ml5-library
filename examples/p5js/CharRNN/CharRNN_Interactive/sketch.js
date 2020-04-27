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
let textInput;
let tempSlider;
let lengthSlider;
let runningInference = false;

function setup() {
  noCanvas();

  // Create the LSTM Generator passing it the model directory
  charRNN = ml5.charRNN('models/woolf/', modelReady);

  // Grab the DOM elements
  textInput = select('#textInput');
  lengthSlider = select('#lenSlider');
  tempSlider = select('#tempSlider');

  // Run generate anytime something changes
  textInput.input(generate);
  lengthSlider.input(generate);
  tempSlider.input(generate);
}

function modelReady() {
  select('#status').html('Model Loaded');
}

function generate() {
  // prevent starting inference if we've already started another instance
  // TODO: is there better JS way of doing this?
  if(!runningInference) {
    runningInference = true;

    // Update the status log
    select('#status').html('Generating...');

    // Update the length and temperature span elements
    select('#length').html(lengthSlider.value());
    select('#temperature').html(tempSlider.value());

    // Grab the original text
    let original = textInput.value();
    // Make it to lower case
    let txt = original.toLowerCase();

    // Check if there's something
    if (txt.length > 0) {
      // Here is the data for the LSTM generator
      let data = {
        seed: txt,
        temperature: tempSlider.value(),
        length: lengthSlider.value()
      };

      // Generate text with the charRNN
      charRNN.generate(data, gotData);

      // Update the DOM elements with typed and generated text
      function gotData(err, result) {
        select('#status').html('Ready!');
        select('#original').html(original);
        select('#prediction').html(result.sample);
        runningInference = false;
      }
    } else {
      // Clear everything
      select('#original').html('');
      select('#prediction').html('');
    }
  }
}
