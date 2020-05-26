// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
KNN Classification on Webcam Images with mobileNet. Built with p5.js
=== */
let video;
let posX;
let posY;
const squareSize = 100;
// Create a KNN classifier
const knnClassifier = ml5.KNNClassifier();
let featureExtractor;

function setup() {
  // Create a featureExtractor that can extract the already learned features from MobileNet
  featureExtractor = ml5.featureExtractor("MobileNet", modelReady);

  const canvas = createCanvas(640, 480);
  posX = width / 2;
  posY = height / 2;
  // Put the canvas into the <div id="canvasContainer"></div>.
  canvas.parent("#canvasContainer");
  // Create a video element
  video = createCapture(VIDEO);
  video.size(width, height);
  // Hide the video element, and just show the canvas
  video.hide();
  // Create the UI buttons
  createButtons();
  noStroke();
  fill(255, 0, 0);
}

function draw() {
  // Flip the video from left to right, mirror the video
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);

  // draw a square on the canvas
  rect(posX, posY, squareSize, squareSize);
}

function modelReady() {
  select("#status").html("FeatureExtractor(mobileNet model) Loaded");
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
    console.error("There is no examples in any label");
    return;
  }
  // Get the features of the input video
  const features = featureExtractor.infer(video);

  // Use knnClassifier to classify which label do these features belong to
  knnClassifier.classify(features, gotResults);
}

// A util function to create UI buttons
function createButtons() {
  // When the addClass1 button is pressed, add the current frame to class "Up"
  buttonA = select("#addClass1");
  buttonA.mousePressed(function() {
    addExample("Up");
  });

  // When the addClass2 button is pressed, add the current frame to class "Right"
  buttonB = select("#addClass2");
  buttonB.mousePressed(function() {
    addExample("Right");
  });

  // When the addClass3 button is pressed, add the current frame to class "Down"
  buttonC = select("#addClass3");
  buttonC.mousePressed(function() {
    addExample("Down");
  });

  // When the addClass4 button is pressed, add the current frame to class "Left"
  buttonC = select("#addClass4");
  buttonC.mousePressed(function() {
    addExample("Left");
  });

  // Predict button
  buttonPredict = select("#buttonPredict");
  buttonPredict.mousePressed(classify);

  // Clear all classes button
  buttonClearAll = select("#clearAll");
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
      select("#result").html(result.label);
      select("#confidence").html(`${confidences[result.label] * 100} %`);

      switch (result.label) {
        case "Up":
          posY -= 2;
          break;

        case "Down":
          posY += 2;
          break;

        case "Left":
          posX += 2;
          break;

        case "Right":
          posX -= 2;
          break;

        default:
          console.log(`Sorry, unknown label: ${result.label}`);
      }
      // Border checking
      if (posY < 0) posY = 0;
      if (posY > height - squareSize) posY = height - squareSize;
      if (posX < 0) posX = 0;
      if (posX > width - squareSize) posX = width - squareSize;
    }
  }

  classify();
}

// Update the example count for each class
function updateCounts() {
  const counts = knnClassifier.getCountByLabel();

  select("#example1").html(counts.Up || 0);
  select("#example2").html(counts.Right || 0);
  select("#example3").html(counts.Down || 0);
  select("#example4").html(counts.Left || 0);
}

// Clear the examples in one class
function clearLabel(classLabel) {
  knnClassifier.clearLabel(classLabel);
  updateCounts();
}

// Clear all the examples in all classes
function clearAllLabels() {
  knnClassifier.clearAllLabels();
  updateCounts();
}
