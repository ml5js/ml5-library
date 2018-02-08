---
id: transform-net-example
title: Fast Style Transfer
---

Fast Style Transfer example. Built with [p5.js](https://p5js.org/).

## Demo

<div class="example">
  <style>
    .example img {
      width: 250px;
      height: 250px;
    }
  </style>
  <p>Input Image:</p>
  <img id="inputImg" src='assets/img/patagonia.jpg'/>

  <p>Style A: <a href="https://en.wikipedia.org/wiki/The_Great_Wave_off_Kanagawa">The Great Wave off Kanagawa, 1829 - Katsushika Hokusai</a></p>
  <img src='assets/img/wave.jpg'/>
  <span id="resultImgOne"></span>

  <p>Style B: <a href="https://en.wikipedia.org/wiki/File:Francis_Picabia,_1913,_Udnie_(Young_American_Girl,_The_Dance),_oil_on_canvas,_290_x_300_cm,_Mus%C3%A9e_National_d%E2%80%99Art_Moderne,_Centre_Georges_Pompidou,_Paris..jpg">Udnie (Young American Girl, The Dance), 1913 - Francis Picabia</a></p>
  <img src='assets/img/udnie.jpg'/>
  <span id="resultImgTwo"></span>

</div>

<script src="assets/scripts/example-transform-net.js"></script>

## Code

```javascript
// Two Fast Style Transfer styles
let fst1;
let fst2;

let inputImg;
let outputOne;
let outputTwo;

function setup() {
  noCanvas();
  inputImg = select('#inputImg').elt;
  outputOne = select('#resultImgOne').elt;
  outputTwo = select('#resultImgTwo').elt;

  // Load the models
  fst1 = new ml5.TransformNet('assets/models/wave', loadedModelOne);
  fst2 = new ml5.TransformNet('assets/models/udnie', loadedModelTwo);
}

// A function to be called when the first model has been loaded
function loadedModelOne() {
  const result = fst1.predict(inputImg);
  // Convert the Array3D with image data to a html image element
  const resultImg = ml5.array3DToImage(result);
  // Show img
  outputOne.append(resultImg);
}

// A function to be called when the second model has been loaded
function loadedModelTwo() {
  const result = fst2.predict(inputImg);
  // Convert the Array3D with image data to a html image element
  const resultImg = ml5.array3DToImage(result);
  // Show img
  outputTwo.append(resultImg);
}
```

## [Source](https://github.com/ITPNYU/ml5/tree/master/examples/fast_style_transfer)