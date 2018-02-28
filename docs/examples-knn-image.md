---
id: knn-image-example
title: KNN Image Classification
---

Train and classify frames from a live webcam stream using the [KNN Image Classifier](api-Imagenet.md).

*Please enable your webcam*

## Demo

<div class="example">
  <style>
    button {
      margin: 4px;
      padding: 8px;
    }
  </style>

  <video width="320" height="240" autoplay id="video"></video>
  <p id="loader">Loading the model...</p>

  <div>
    <button id="buttonA">Train A</button>
    <button id="resetA">Reset A</button>
    <h6><span id="exampleA">0</span> Examples in A | Confidence in A is: <span id="confidenceA">0</span></h6>
    <br><button id="buttonB">Train B</button>
    <button id="resetB">Reset B</button>
    <h6><span id="exampleB">0</span> Examples in B | Confidence in B is: <span id="confidenceB">0</span></h6>
  </div>
  <p>
    <button id="predict">Start guessing!</button><br>
    My guess is category: <span id="result">...</span>.
  </p>
</div>

<script src="assets/scripts/example-knn-image.js"></script>

## Code

```javascript
// Set up the video stream
const video = document.getElementById('video');
navigator.getUserMedia({ video: true }, handleVideo, videoError);

function handleVideo(stream) {
  video.src = window.URL.createObjectURL(stream);
}

function videoError() {
  console.error('Video not available');
}

// A function to be called when the model has been loaded
function modelLoaded() {
  document.getElementById('loader').innerText = 'Model loaded!';
}

// Start the KNN Classifier
const knn = new ml5.KNNImageClassifier(modelLoaded, video, 2, 1);

// Train Buttons
document.getElementById('buttonA').onclick = () => train(1);
document.getElementById('buttonB').onclick = () => train(2);

// Reset buttons
document.getElementById('resetA').onclick = () => {
  clearClass(1);
  updateExampleCounts();
};
document.getElementById('resetB').onclick = () => {
  clearClass(2);
  updateExampleCounts();
};

// Predict Button
document.getElementById('predict').onclick = () => predict();

// A function to train the Classifier on a frame from the video.
function train(category) {
  knn.addImage(category);
  updateExampleCounts();
}

// Predict the current frame.
function predict() {
  knn.predict((results) => {
    let msg;

    if (results.classIndex === 1) {
      msg = 'A';
    } else if (results.classIndex === 2) {
      msg = 'B';
    }
    document.getElementById('result').innerText = msg;

    // Update confidence
    document.getElementById('confidenceA').innerText = results.confidences[1];
    document.getElementById('confidenceB').innerText = results.confidences[2];

    setTimeout(() => predict(), 150);
  });
}

// Clear the data in one class
function clearClass(classIndex) {
  knn.clearClass(classIndex);
}

// Update the example count for each class
function updateExampleCounts() {
  const counts = knn.getClassExampleCount();
  document.getElementById('exampleA').innerText = counts[1];
  document.getElementById('exampleB').innerText = counts[2];
}

```

## [Source](https://github.com/ITPNYU/ml5/tree/master/examples/KNNImage)

