// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Sound classification using SpeechCommands18w and p5.js
This example uses a callback pattern to create the classifier
=== */

// Initialize a sound classifier method with SpeechCommands18w model. A callback needs to be passed.
let classifier;
// Options for the SpeechCommands18w model, the default probabilityThreshold is 0
const options = { probabilityThreshold: 0.7 };
// Two variable to hold the label and confidence of the result
let label;
let confidence;

const modelJson =
  "https://storage.googleapis.com/tm-speech-commands/eye-test-sound-yining/model.json";

async function setup() {
  classifier = await ml5.soundClassifier(modelJson);
  // Create 'label' and 'confidence' div to hold results

  label = document.createElement("DIV");
  label.textContent = "label ...";
  confidence = document.createElement("DIV");
  confidence.textContent = "Confidence ...";

  document.body.appendChild(label);
  document.body.appendChild(confidence);
  // Classify the sound from microphone in real time
  classifier.classify(gotResult);
}
setup();

// A function to run when we get any errors and the results
function gotResult(error, results) {
  // Display error in the console
  if (error) {
    console.error(error);
  }
  // The results are in an array ordered by confidence.
  console.log(results);
  // Show the first label and confidence
  label.textContent = `Label: ${results[0].label}`;
  confidence.textContent = `Confidence: ${results[0].confidence.toFixed(4)}`;
}
