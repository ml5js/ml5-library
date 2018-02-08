---
id: lstm-interactive-example
title: Interactive LSTM
---

An interactive LSTM text generation example using a model trained on a corpus of [Ernest Hemingway](https://en.wikipedia.org/wiki/Ernest_Hemingway). Built with [p5.js](https://p5js.org/).

## Demo

<div class="example">
  <textarea id="textInput" style="width: 400px; height: 100px;" placeholder="Type something here..."></textarea>
  <br/> length:
  <input id="lenSlider" type="range" min="1" max="100" value="20"> <span id="length">20</span>
  <br/> temperature:
  <input id="tempSlider" type="range" min="0" max="1" step="0.01"><span id="temperature">0.5</span>
  <p id="result">
    <span id="original"></span><span id="prediction"></span>
  </p>
</div>

<script src="assets/scripts/example-lstm-interactive.js"></script>

## Code

```javascript
let textInput;
let tempSlider;
let lengthSlider;
let lstm;

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

  // Create the LSTM Generator
  // Point it to a directory of model files
  lstm = new ml5.LSTMGenerator('models/hemingway/');
}

function generate() {

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

    // Generate text with the lstm
    lstm.generate(data, gotData);

    // Update the DOM elements with typed and generated text
    function gotData(result) {
      select('#original').html(original);
      select('#prediction').html(result.generated);
    }
  } else {
    // Clear everything
    select('#original').html('');
    select('#prediction').html('');
  }
}

```

## [Source](https://github.com/ITPNYU/ml5/tree/master/examples/lstm_interactive)

