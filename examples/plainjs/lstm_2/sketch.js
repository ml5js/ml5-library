/*
===
RNN/LSTM
deeplearn.js meets p5

Original Repo: https://github.com/shiffman/NOC-S17-2-Intelligence-Learning
Originally ported to ES6 with deeplearn.js by Cristóbal Valenzuela

===
*/

let textInput;
let tempSlider;
let lengthSlider;
let waiting = false;
let variables;

function preload(){
  variables = loadJSON('variables.json');
}

function setup() {
  noCanvas();
  // Grab the DOM elements
  textInput = select('#textInput');
  lengthSlider = select('#lenSlider');
  tempSlider = select('#tempSlider');

  // Run generate anytime something changes
  textInput.input(generate);
  lengthSlider.input(generate);
  tempSlider.input(generate);
}

function generate() {

  // Update the length and temperature span elements
  select('#length').html(lengthSlider.value())
  select('#temperature').html(tempSlider.value())

  // Grab the original text
  let original = textInput.value();
  // Make it to lower case
  let txt = original.toLowerCase();

  // Check if there's something to send
  if (txt.length > 0) {
    // Here is the data to post
    let data = {
      seed: txt,
      temperature: tempSlider.value(),
      length: lengthSlider.value()
    }

    lstm(data, gotData);
    function gotData(result) {
      select('#original').html(original);
      select('#prediction').html(result.sentence);
    }
  } else {
    select('#original').html('');
    select('#prediction').html('');
  }

}
