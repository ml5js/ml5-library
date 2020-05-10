// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Webcam Image Classification using DoodleNet
This example uses a callback pattern to create the classifier
=== */

// Initialize the Image Classifier method with DoodleNet.
let classifier;

// A variable to hold the Webcam video we want to classify
let video;

// Two variable to hold the label and confidence of the result
let label;
let confidence;
let canvas;
let ctx;

const width = 280;
const height = 280;

async function setup() {
  // Create a 'label' and 'confidence' div to hold results
  label = document.querySelector('#label');
  confidence = document.querySelector('#confidence');
  // Create a camera input
  video = document.querySelector('#myCanvas');
  
  video = await getVideo();

  classifier = await ml5.imageClassifier('DoodleNet', video);

  classifyVideo();
  
}
setup();


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
  label.innerHTML =  results[0].label;
  confidence.innerHTML =  results[0].confidence.toFixed(4); // Round the confidence to 0.01
  // Call classifyVideo again
  classifyVideo();
}


// Helper Functions
async function getVideo(){
  // Grab elements, create settings, etc.
  const videoElement = document.createElement('video');
  // videoElement.setAttribute("style", "display: none;"); 
  videoElement.width = width;
  videoElement.height = height;
  document.body.appendChild(videoElement);

  // Create a webcam capture
  const capture = await navigator.mediaDevices.getUserMedia({ video: true })
  videoElement.srcObject = capture;
  videoElement.play();

  return videoElement
}