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

async function setup() {
  // Create a featureExtractor that can extract the already learned features from MobileNet
  featureExtractor =  ml5.featureExtractor('MobileNet', modelReady);
  // Create a video element
  // Grab elements, create settings, etc.
  video = document.getElementById('video');

  // Create a webcam capture
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true
  });
  video.srcObject = stream;
  video.play();
  // Create the UI buttons
  createButtons();
}

setup();

function modelReady() {
  // console.log(featureExtractor)
  document.querySelector('#status').textContent = 'FeatureExtractor(mobileNet model) Loaded';
}

// Add the current frame from the video to the classifier
function addExample(label) {
  // Get the features of the input video
  const features = featureExtractor.infer(video);
  // You can also pass in an optional endpoint, defaut to 'conv_preds'
  // const features = featureExtractor.infer(video, 'conv_preds');
  // You can list all the endpoints by calling the following function
  // console.log('All endpoints: ', featureExtractor.mobilenet.endpoints)

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
  // You can also pass in an optional K value, K default to 3
  // knnClassifier.classify(features, 3, gotResults);

  // You can also use the following async/await function to call knnClassifier.classify
  // Remember to add `async` before `function predictClass()`
  // const res = await knnClassifier.classify(features);
  // gotResults(null, res);
}

// A util function to create UI buttons
function createButtons() {
  // When the A button is pressed, add the current frame
  // from the video with a label of "rock" to the classifier
  buttonA = document.querySelector('#addClassRock');
  buttonA.addEventListener('click', function () {
    addExample('Rock');
  });

  // When the B button is pressed, add the current frame
  // from the video with a label of "paper" to the classifier
  buttonB = document.querySelector('#addClassPaper');
  buttonB.addEventListener('click', function () {
    addExample('Paper');
  });

  // When the C button is pressed, add the current frame
  // from the video with a label of "scissor" to the classifier
  buttonC = document.querySelector('#addClassScissor');
  buttonC.addEventListener('click', function () {
    addExample('Scissor');
  });

  // Reset buttons
  resetBtnA = document.querySelector('#resetRock');
  resetBtnA.addEventListener('click', function () {
    clearLabel('Rock');
  });

  resetBtnB = document.querySelector('#resetPaper');
  resetBtnB.addEventListener('click', function () {
    clearLabel('Paper');
  });

  resetBtnC = document.querySelector('#resetScissor');
  resetBtnC.addEventListener('click', function () {
    clearLabel('Scissor');
  });

  // Predict button
  buttonPredict = document.querySelector('#buttonPredict');
  buttonPredict.addEventListener('click', classify);

  // Clear all classes button
  buttonClearAll = document.querySelector('#clearAll');
  buttonClearAll.addEventListener('click', clearAllLabels);

  // Load saved classifier dataset
  buttonSetData = document.querySelector('#load');
  buttonSetData.addEventListener('click', loadMyKNN);

  // Get classifier dataset
  buttonGetData = document.querySelector('#save');
  buttonGetData.addEventListener('click', saveMyKNN);
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
      document.querySelector('#result').textContent = result.label;
      document.querySelector('#confidence').textContent = `${confidences[result.label] * 100} %`;
    }

    document.querySelector('#confidenceRock').textContent = `${confidences.Rock ? confidences.Rock * 100 : 0} %`;
    document.querySelector('#confidencePaper').textContent = `${confidences.Paper ? confidences.Paper * 100 : 0} %`;
    document.querySelector('#confidenceScissor').textContent = `${confidences.Scissor ? confidences.Scissor * 100 : 0} %`;
  }

  classify();
}

// Update the example count for each label	
function updateCounts() {
  const counts = knnClassifier.getCountByLabel();

  document.querySelector('#exampleRock').textContent = counts.Rock || 0;
  document.querySelector('#examplePaper').textContent = counts.Paper || 0;
  document.querySelector('#exampleScissor').textContent = counts.Scissor || 0;
}

// Clear the examples in one label
function clearLabel(label) {
  knnClassifier.clearLabel(label);
  updateCounts();
}

// Clear all the examples in all labels
function clearAllLabels() {
  knnClassifier.clearAllLabels();
  updateCounts();
}

// Save dataset as myKNNDataset.json
function saveMyKNN() {
  knnClassifier.save('myKNNDataset');
}

// Load dataset to the classifier
function loadMyKNN() {
  knnClassifier.load('./myKNNDataset.json', updateCounts);
}