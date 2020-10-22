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
let runningInference = true;

let generated = false;
let last;

function setup() {
  noCanvas();

  // Create the LSTM Generator passing it the model directory
  charRNN = ml5.charRNN('models/woolf/', modelReady);

  // Grab the DOM elements
  textInput = select('#textInput');
  lengthSlider = select('#lenSlider');
  tempSlider = select('#tempSlider');

  // Run generate anytime something changes
  textInput.input(changing);
  lengthSlider.input(changing);
  tempSlider.input(changing);

  // Check every so often if we should generate something new
  setInterval(checkGenerate, 500);
}

function modelReady() {
  select('#status').html('Model Loaded');
  runningInference = false;
}

// Has 500 milliseconds passed since the last time a change was made?
function checkGenerate() {
  let passed = millis() - last;
  if (passed > 500 && !generated) {
    generate();
    generated = true;
  }
}

// Update the time
function changing() {
  generated = false;
  last = millis();
}

// Generate new text!
function generate() {
  // Grab the original text
  const original = textInput.value();
  // Make it to lower case
  const txt = original.toLowerCase();

  // prevent starting inference if we've already started another instance
  // or if there is no prompt
  // TODO: is there better JS way of doing this?
  if (!runningInference && txt.length > 0) {
    runningInference = true;

    // Update the status log
    select('#status').html('Generating...');

    // Update the length and temperature span elements
    select('#length').html(lengthSlider.value());
    select('#temperature').html(tempSlider.value());

    // Here is the data for the LSTM generator
    const data = {
      seed: txt,
      temperature: tempSlider.value(),
      length: lengthSlider.value(),
    };

    // Generate text with the charRNN
    charRNN.generate(data, gotData);

    // Update the DOM elements with typed and generated text
    function gotData(err, result) {
      runningInference = false;
      if (err) {
        console.error(err);
        return;
      }
      select('#status').html('Ready!');
      select('#original').html(original);
      select('#prediction').html(result.sample);
    }
  }
}
