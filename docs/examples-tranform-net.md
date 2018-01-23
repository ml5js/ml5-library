---
id: transform-net-example
title: Fast Style Transfer Example
---

Fast Style Transfer [Ernest Hemingway](https://en.wikipedia.org/wiki/Ernest_Hemingway). Built with [p5.js](https://p5js.org/).

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