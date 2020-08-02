// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
KNN Classification on Webcam Images with mobileNet. Built with p5.js
=== */
let video;
// Create a KNN classifier
const knnClassifier = ml5.KNNClassifier();

let featureExtractor;
let currentWord;
let myVoice;

function setup() {
  // Create a featureExtractor that can extract the already learned features from MobileNet
  featureExtractor = ml5.featureExtractor('MobileNet', modelReady);
  noCanvas();
  // Create a video element
  video = createCapture(VIDEO);
  // Append it to the videoContainer DOM element
  video.parent('videoContainer');
  // Create the UI buttons
  createButtons();
  // Speech synthesis object
  myVoice = new p5.Speech();
  // The speak() method will interrupt existing speech currently being synthesized.
  myVoice.interrupt = true;
}

function modelReady() {
  select('#status').html('FeatureExtractor(mobileNet model) Loaded')
}

// Add the current frame from the video to the classifier
function addExample(label) {
  // Get the features of the input video
  const features = featureExtractor.infer(video);

  // Add an example with a label to the classifier
  knnClassifier.addExample(features, label);
  updateCounts();
}

// Predict the current frame.
function classify() {
  // Get the total number of labels from knnClassifier
  const numLabels = knnClassifier.getNumLabels();
  if (numLabels <= 0) {
    console.error('There is no examples in any label');
    return;
  }
  // Get the features of the input video
  const features = featureExtractor.infer(video);

  // Use knnClassifier to classify which label do these features belong to
  // You can pass in a callback function `gotResults` to knnClassifier.classify function
  knnClassifier.classify(features, gotResults);
}

// A util function to create UI buttons
function createButtons() {
  // When the A button is pressed, add the current frame to class "Hello"
  buttonA = select('#addClass1');
  buttonA.mousePressed(function() {
    addExample('Hello');
  });

  // When the B button is pressed, add the current frame to class "goodbye"
  buttonB = select('#addClass2');
  buttonB.mousePressed(function() {
    addExample('Goodbye');
  });

  // Predict button
  buttonPredict = select('#buttonPredict');
  buttonPredict.mousePressed(classify);

  // Clear all classes button
  buttonClearAll = select('#clearAll');
  buttonClearAll.mousePressed(clearAllLabels);
}

// Show the results
function gotResults(err, result) {
  // Display any error
  if (err) {
    console.error(err);
  }

  if (result.confidencesByLabel) {
    const confidences = result.confidencesByLabel;
    // result.label is the label that has the highest confidence
    if (result.label) {
      select('#result').html(result.label);
      select('#confidence').html(`${confidences[result.label] * 100} %`);

      // If the confidence is higher then 0.9
      if (result.label !== currentWord && confidences[result.label] > 0.9) {
        currentWord = result.label;
        // Say the current word 
        myVoice.speak(currentWord);
      }
    }
  }

  classify();
}

// Update the example count for each class	
function updateCounts() {
  const counts = knnClassifier.getCountByLabel();

  select('#example1').html(counts.Hello || 0);
  select('#example2').html(counts.Goodbye || 0);
}

// Clear all the examples in all classes
function clearAllLabels() {
  knnClassifier.clearAllLabels();
  updateCounts();
}
