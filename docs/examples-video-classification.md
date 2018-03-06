---
id: video-classification-example
title: Video Classification
---

Classify a live webcam stream using the [KNN Image Classifier](api-Imagenet.md). Built using [p5.js](https://p5js.org/).

*Please enable your webcam*

## Demo

<div class="example">
  <video id="video" autoplay width="320" height="240"></video>
  <p>My guess is a <span id="result">...</span>.
  <br/>My confidence is <span id="probability">...</span>.
  </p>
</div>

<script src="assets/scripts/example-video-classification.js"></script>

## Code

```javascript
// Initialize the imageNet method with the MobileNet model.
const imagenet = new ml5.ImageNet('MobileNet');

// Set up the video stream
const video = document.getElementById('video');
navigator.getUserMedia({ video: true }, handleVideo, videoError);

function handleVideo(stream) {
  video.src = window.URL.createObjectURL(stream);
  guess(); // Once the video is set up, start predicting
}

function videoError(err) {
  console.error('Video not available');
}

// Get a prediction for that image
function guess() {
  imagenet.predict(video, 10, gotResult);
}

// When we get the results
function gotResult(results) {
  const result = document.getElementById('result');
  const probability = document.getElementById('probability');
  result.innerText = results[0].label;
  probability.innerText = results[0].probability.toFixed(2);
  setTimeout(guess, 350);
}
```

## [Source](https://github.com/ITPNYU/ml5/tree/master/examples/imagenetCamera)

