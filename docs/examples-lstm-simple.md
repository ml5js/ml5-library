---
id: lstm-simple-example
title: Simple LSTM
---

A simple LSTM text generation example using a model trained on a corpus of [Ernest Hemingway](https://en.wikipedia.org/wiki/Ernest_Hemingway). Built with [p5.js](https://p5js.org/).

## Demo

<div class="example">
  <p>
    seed text:
    <input id="textInput" value="She was sitting next to" />
    <br/> length:
    <input id="lenSlider" type="range" min="10" max="500" value="100"> <span id="length">100</span>
    <br/> temperature:
    <input id="tempSlider" type="range" min="0" max="1" step="0.01"><span id="temperature">0.5</span>
  </p>
  <p>
    <button id="generate">generate</button>
  </p>
  <p id="result"></p>
</div>

<script src="assets/scripts/example-lstm-simple.js"></script>

## Code

```javascript
let lstm;

function setup() {
  noCanvas();

  // Create the LSTM Generator
  // Pass in a model directory
  lstm = new ml5.LSTMGenerator('models/hemingway/');

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
```

## [Source](https://github.com/ITPNYU/ml5-js/tree/master/examples/lstm_simple)

