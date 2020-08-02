// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Webcam Image Classification using DoodleNet and p5.js
This example uses a callback pattern to create the classifier
=== */

// Initialize the Image Classifier method with DoodleNet.
let classifier;

// A variable to hold the Webcam video we want to classify
let video;

// Two variable to hold the label and confidence of the result
let label;
let confidence;

function preload() {
  // Create a camera input
  video = createCapture(VIDEO, {
    video: {
      width: 280,
      height: 280,
      aspectRatio: 1
    } 
  });
  // Load the DoodleNet Image Classification model
  classifier = ml5.imageClassifier('DoodleNet', video);
}

function setup() {
  // Create a 'label' and 'confidence' div to hold results
  label = createDiv('Label: ...');
  confidence = createDiv('Confidence: ...');

  classifyVideo();
}

// Get a prediction for the current video frame
function classifyVideo() {
  classifier.classify(gotResult);
}

// A function to run when we get any errors and the results
function gotResult(error, results) {
  // Display error in the console
  if (error) {
    console.error(error);
  }
  // The results are in an array ordered by confidence.
  console.log(results);
  // Show the first label and confidence
  label.html(`Label: ${results[0].label}`);
  confidence.html(`Confidence: ${nf(results[0].confidence, 0, 2)}`); // Round the confidence to 0.01
  // Call classifyVideo again
  classifyVideo();
}
