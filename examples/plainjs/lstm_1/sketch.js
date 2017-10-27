/*
===
RNN/LSTM
deeplearn.js meets p5

Original Repo: https://github.com/shiffman/NOC-S17-2-Intelligence-Learning
Originally ported to ES6 with deeplearn.js by Cristóbal Valenzuela

===
*/

let variables;

function preload() {
  variables = loadJSON('variables.json');
}

function setup() {
  noCanvas();
  
  // Grab the DOM elements
  let textInput = select('#textInput');
  let lengthSlider = select('#lenSlider');
  let tempSlider = select('#tempSlider');
  let button = select('#generate');
  button.mousePressed(generate);


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
        console.log(result);
        select('#result').html(txt + result.sentence);
      }
    }
  }
}
