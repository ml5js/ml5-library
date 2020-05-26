// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Webcam Image Classification using a pre-trianed customized model and p5.js
This example uses p5 preload function to create the classifier
=== */

const checkpoint =
  "https://storage.googleapis.com/tm-pro-a6966.appspot.com/eyeo-test-yining/model.json";
let classifier;

// Grab elements, create settings, etc.
const video = document.getElementById("video");
const resultsP = document.getElementById("resultP");
// Create a webcam capture
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
  video.play();
});

const loop = classifier => {
  classifier.classify(video).then(results => {
    if (results.length > 0) {
      resultsP.innerHTML = `Label: ${results[0].label} ${results[0].confidence.toFixed(4)}`;
      loop(classifier); // Call again to create a loop
    }
  });
};

// Initialize the Image Classifier method with MobileNet passing the video as the
// second argument and the getClassification function as the third
ml5.imageClassifier(checkpoint).then(classifier => loop(classifier));
