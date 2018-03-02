---
id: lstm-simple-example
title: Simple LSTM
---

A simple LSTM text generation example using a model trained on a corpus of [Ernest Hemingway](https://en.wikipedia.org/wiki/Ernest_Hemingway). Built with [p5.js](https://p5js.org/).

## Demo

In this demo you ask the LSTM: "Starting with the seed text, predict what text might come next based on your pre-trained Ernest Hemingway model." Changing `length` changes the number of characters in the resulting predicted text. Higher `length` values can take many minutes to compute and use a lot of CPU. The `temperature` controls the randomness of the output. A `temperature` of 0 will be relatively random but might not even look like English, while a `temperature` of 1.0 will probably be correct English but will also be very close to the original Hemingway, perhaps even straight quotations.

<div class="example">
  <p>
    seed text:
    <input id="textInput" value="She was sitting next to" />
    <br/> length:
    <input id="lenSlider" onchange="updateSliders()" type="range" min="10" max="500" value="100"> <span id="length">100</span>
    <br/> temperature:
    <input id="tempSlider" onchange="updateSliders()" type="range" min="0" max="1" step="0.01"><span id="temperature">0.5</span>
  </p>
  <p>
    <button id="generate" onclick="generate()">generate</button>
  </p>
  <p id="result"></p>
</div>

<script src="assets/scripts/example-lstm-simple.js"></script>

## Code

```html
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
```

```javascript
let lstm;

// Create the LSTM Generator
// Pass in a model directory
lstm = new ml5.LSTMGenerator('models/hemingway/');

// Grab the DOM elements
let textInput = document.getElementById('textInput');
let lengthSlider = document.getElementById('lenSlider');
let tempSlider = document.getElementById('tempSlider');
let button = document.getElementById('generate');

// Update the slider values
function updateSliders() {
  document.getElementById('length').innerHTML = lengthSlider.value;
  document.getElementById('temperature').innerHTML = tempSlider.value;
}

// Generate new text
function generate() {
  // Grab the original text
  let original = textInput.value;
  // Make it to lower case
  let txt = original.toLowerCase();
  // Check if there's something to send
  if (txt.length > 0) {
    // This is what the LSTM generator needs
    let data = {
      seed: txt,
      temperature: tempSlider.value,
      length: lengthSlider.value
    };

    // Generate text with the lstm
    lstm.generate(data, gotData);

    // When it's done
    function gotData(result) {
      document.getElementById('result').innerHTML = txt + result.generated;
    }
  }
}
```

## [Source](https://github.com/ITPNYU/ml5/tree/master/examples/lstm_simple)

