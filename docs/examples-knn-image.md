---
id: knn-image-example
title: KNN Image Classification
---

Train and classify frames from a live webcam stream using the [KNN Image Classifier](api-Imagenet.md). Built with [p5.js](https://p5js.org/).

*Please enable your webcam*

## Demo

<div class="example">
  <style>
    button {
      margin: 4px;
      padding: 8px;
    }
  </style>
  <div id="canvasContainer"></div>

  <span id="loading">Loading the model...</span>
  
  <p>
    <button id="buttonA">Train A</button>
    <button id="resetA">Reset A</button>
    <p><span id="exampleA">0</span> Examples in A</p>
    <p>Confidence in A is: <span id="confidenceA">0</span></p>
    <br><button id="buttonB">Train B</button>
    <button id="resetB">Reset B</button>
    <p><span id="exampleB">0</span> Examples in B</p>
    <p>Confidence in B is: <span id="confidenceB">0</span></p>
    <br> Training on: <span id="training"></span>
  </p>
  <p>
    <button id="buttonPredict">Start guessing!</button><br>
    My guess is category: <span id="result">...</span>.
  </p>
</div>

<script src="assets/scripts/example-knn-image.js"></script>

## Code

```javascript
let knn;
let video;

function preload() {
  // Initialize the KNN method.
  knn = new ml5.KNNImageClassifier(modelLoaded, 2, 1);
}

function setup() {
  createCanvas(320, 240).parent('canvasContainer');
  video = createCapture(VIDEO);
  background(0);
  video.size(227, 227);
  video.hide();

  // Train buttons
  buttonA = select('#buttonA');
  buttonA.mousePressed(() => {
    train(1);
  });

  buttonB = select('#buttonB');
  buttonB.mousePressed(() => {
    train(2);
  });

  // Reset buttons
  resetBtnA = select('#resetA');
  resetBtnA.mousePressed(() => {
    clearClass(1);
    updateExampleCounts();
  });

  resetBtnB = select('#resetB');
  resetBtnB.mousePressed(() => {
    clearClass(2);
    updateExampleCounts();
  });

  buttonPredict = select('#buttonPredict');
  buttonPredict.mousePressed(predict);
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);
}

// A function to be called when the model has been loaded
function modelLoaded() {
  select('#loading').html('Model loaded!');
}

// Train the Classifier on a frame from the video.
function train(category) {
  let msg;
  if (category == 1) {
    msg = 'A';
  } else if (category == 2) {
    msg = 'B';
  }
  select('#training').html(msg);
  knn.addImage(video.elt, category);
  updateExampleCounts();
}

// Predict the current frame.
function predict() {
  knn.predict(video.elt, gotResults);
}

// Show the results
function gotResults(results) {
  let msg;

  if (results.classIndex == 1) {
    msg = 'A';
  } else if (results.classIndex == 2) {
    msg = 'B';
  }
  select('#result').html(msg);

  // Update confidence
  select('#confidenceA').html(results.confidences[1]);
  select('#confidenceB').html(results.confidences[2]);

  setTimeout(() => predict(), 50);
}

// Clear the data in one class
function clearClass(classIndex) {
  knn.clearClass(classIndex);
}

// Update the example count for each class
function updateExampleCounts() {
  let counts = knn.getClassExampleCount();
  select('#exampleA').html(counts[1]);
  select('#exampleB').html(counts[2]);
}

```

## [Source](https://github.com/ITPNYU/ml5/tree/master/examples/KNNImage)

