/*
===
LSTM Simple Example
===
*/

let lstm;

function setup() {
  noCanvas();

  // Create the LSTM Generator
  // Pass in a model directory
  lstm = new p5ml.LSTMGenerator('assets/models/hemingway/');

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
    if (txt.length > 0) {
      // This is what the LSTM generator needs
      // Seed text, temperature, length to outputs
      // TODO: What are the defaults?
      let data = {
        seed: txt,
        temperature: tempSlider.value(),
        length: lengthSlider.value()
      };

      // Generate text with the lstm
      lstm.generate(data, gotData);

      // When it's done
      function gotData(result) {
        select('#result').html(txt + result.generated);
      }
    }
  }
}
