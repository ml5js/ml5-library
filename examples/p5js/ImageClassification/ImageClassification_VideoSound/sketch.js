// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Webcam Image Classification using MobileNet and p5.js
This example uses a callback pattern to create the classifier
=== */

let classifier;
let video;
// Create a new p5.speech object
// You can also control the Language, Rate, Pitch and Volumn of the voice
// Read more at http://ability.nyu.edu/p5.js-speech/
const myVoice = new p5.Speech();

function setup() {
  noCanvas();
  // Create a camera input
  video = createCapture(VIDEO);
  // Initialize the Image Classifier method with MobileNet and the video as the second argument
  classifier = ml5.imageClassifier('MobileNet', video, modelReady);
}

function modelReady() {
  // Change the status of the model once its ready
  select('#status').html('Model Loaded');
  // Call the classifyVideo function to start classifying the video
  classifyVideo();
}

// Get a prediction for the current video frame
function classifyVideo() {
  classifier.classify(gotResult);
}

// When we get a result
function gotResult(err, results) {
  // The results are in an array ordered by confidence.
  select('#result').html(results[0].label);
  select('#probability').html(nf(results[0].confidence, 0, 2));
  myVoice.speak(`I see ${results[0].label}`);
  classifyVideo();
}
