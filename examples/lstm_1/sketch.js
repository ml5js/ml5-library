/*
===
RNN/LSTM
deeplearn.js meets p5

Original Repo: https://github.com/shiffman/NOC-S17-2-Intelligence-Learning
Originally ported to ES6 with deeplearn.js by Cristóbal Valenzuela

===
*/

let lstm;

function setup() {
  noCanvas();

  // Create the LSTM Generator
  // Pass in a model directory
  lstm = new p5ml.LSTMGenerator('models/hemingway/')

  // Grab the DOM elements
  let textInput = select('#textInput');
  let lengthSlider = select('#lenSlider');
  let tempSlider = select('#tempSlider');
  let button = select('#generate');

  // DOM element events
  button.mousePressed(generate);
  lengthSlider.input(updateSliders);
  tempSlider.input(updateSliders);

  // Update the slider values
  function updateSliders() {
    select('#length').html(lengthSlider.value())
    select('#temperature').html(tempSlider.value())
  }


  // Generate new text
  function generate() {

    // Grab the original text
    let original = textInput.value();
    // Make it to lower case
    let txt = original.toLowerCase();

    // Check if there's something to send
    // TODO: library should be be able to generate text with
    // no seed text by seeding with random original text
    if (txt.length > 0) {

      // This is what the LSTM generator needs
      // Seed text, temperature, length to outputs
      // TODO: What are the defaults?
      let data = {
        seed: txt,
        temperature: tempSlider.value(),
        length: lengthSlider.value()
      }

      // Generate text with the lstm
      lstm.generate(data, gotData);

      // When it's done
      function gotData(result) {
        select('#result').html(txt + result.generated);
      }
    }
  }
}
