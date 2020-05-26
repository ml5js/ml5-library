// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Sound classification using pre-trained custom SpeechCommands18w and p5.js
This example uses a callback pattern to create the classifier
=== */

const modelJson = 'https://storage.googleapis.com/tm-speech-commands/eye-test-sound-yining/model.json';
// Two variable to hold the label and confidence of the result
let label;
let confidence;
// Initialize a sound classifier method.
let classifier;

function preload() {
  // Load the pre-trianed custom SpeechCommands18w sound classifier model
  classifier = ml5.soundClassifier(modelJson);
}

function setup() {
  noCanvas();
  // ml5 also supports using callback pattern to create the classifier
  // classifier = ml5.soundClassifier(modelJson, modelReady);

  // Create 'label' and 'confidence' div to hold results
  label = createDiv('Label: ...');
  confidence = createDiv('Confidence: ...');
  // Classify the sound from microphone in real time
  classifier.classify(gotResult);
}

// If you use callback pattern to create the classifier, you can use the following callback function
// function modelReady() {
//   classifier.classify(gotResult);
// }

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
}
