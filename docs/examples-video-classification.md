---
id: video-classification-example
title: Video Classification
---

Classify a live webcam stream using the [KNN Image Classifier](api-Imagenet.md). Built using [p5.js](https://p5js.org/).

*Please enable your webcam*

## Demo

<div class="example">
  <div id="canvasContainer"></div>
  <p>My guess is a <span id="result">...</span>.
  <br/>My confidence is <span id="probability">...</span>.
  </p>
</div>

<script src="assets/scripts/example-video-classification.js"></script>

## Code

```javascript
let imagenet;
let video;

function preload() {
  // Initialize the ImageNet method with the MobileNet model.
  imagenet = new ml5.ImageNet('MobileNet');
}

function setup() {
  createCanvas(320, 240).parent('canvasContainer');
  video = createCapture(VIDEO);
  background(0);
  video.attribute('width', 127);
  video.attribute('height', 127);
  video.hide();
  guess();
}

function guess() {
  // Get a prediction for that image
  imagenet.predict(video.elt, 10, gotResult);
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);
}

function gotResult(results) {
  // The results are in an array ordered by probability.
  select('#result').html(results[0].label);
  select('#probability').html(nf(results[0].probability, 0, 2));
  setTimeout(guess, 250);
}

```

## [Source](https://github.com/ITPNYU/ml5/tree/master/examples/imagenetCamera)

