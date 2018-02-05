---
id: fast-style-transfer-webcam-example
title: Fast Style Transfer with Webcam
---

Fast Style Transfer from a live webcam stream using the [TransformNet](api-TransformNet.md). Built with [p5.js](https://p5js.org/).

*Please enable your webcam*

## Demo

<div class="example">
  <style>
    img {
      width: 400px;
      height: 400px;
      -webkit-transform: scaleX(-1);
      transform: scaleX(-1);
    }
    button {
      width: 100px;
      height: 30px;
      font-size: 14px;
      border: solid 2px;
      margin: 10px 0;
      cursor: pointer;
    }
    button:hover {
      color: white;
      background: #333;
    }
  </style>
  <h1>Style Transfer Mirror</h1>
  <div id="input-container"></div>
  <div id="output-container"></div>
  <button onClick="togglePredicting()">Start</button>
</div>

<script src="assets/scripts/example-fast-style-transfer-webcam.js"></script>

## Code

```javascript
const net;
const outputImgData;
const outputImg;
const outputImgContainer;
const video;
let modelReady = false;
let startPredict = false;

function setup() {
  noCanvas();
  // Get live video from webcam
  video = createCapture(VIDEO);
  video.size(200, 200);
  video.hide();
  // Create a TransformNet
  net = new ml5.TransformNet('models/udnie', modelLoaded);
  // Create output image
  outputImgContainer = createImg('images/udnie.jpg', 'image');
  outputImgContainer.parent('output-container');
}

function draw() {
  if (startPredict && modelReady) {
    predict();
  }
}

// A function to be called when the model has been loaded
function modelLoaded() {
  modelReady = true;
}

// Start / stop predicting
function togglePredicting() {
  startPredict = !startPredict;
}

// Transfer the video to an image HTML element
function predict() {
  outputImgData = net.predict(video.elt);
  outputImg = ml5.array3DToImage(outputImgData);
  outputImgContainer.elt.src = outputImg.src;
}

```

## [Source]()

