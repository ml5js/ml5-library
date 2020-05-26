// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
KNN Classification on Webcam Images with poseNet. Built with p5.js
=== */
let video;
// Create a KNN classifier
const knnClassifier = ml5.KNNClassifier();
let poseNet;
let poses = [];

function setup() {
  const canvas = createCanvas(640, 480);
  canvas.parent("videoContainer");
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create the UI buttons
  createButtons();

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on("pose", function(results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
}

function draw() {
  image(video, 0, 0, width, height);

  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  drawSkeleton();
}

function modelReady() {
  select("#status").html("model Loaded");
}

// Add the current frame from the video to the classifier
function addExample(label) {
  // Convert poses results to a 2d array [[score0, x0, y0],...,[score16, x16, y16]]
  const poseArray = poses[0].pose.keypoints.map(p => [p.score, p.position.x, p.position.y]);

  // Add an example with a label to the classifier
  knnClassifier.addExample(poseArray, label);
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
  // Convert poses results to a 2d array [[score0, x0, y0],...,[score16, x16, y16]]
  const poseArray = poses[0].pose.keypoints.map(p => [p.score, p.position.x, p.position.y]);

  // Use knnClassifier to classify which label do these features belong to
  // You can pass in a callback function `gotResults` to knnClassifier.classify function
  knnClassifier.classify(poseArray, gotResults);
}

// A util function to create UI buttons
function createButtons() {
  // When the A button is pressed, add the current frame
  // from the video with a label of "A" to the classifier
  buttonA = select("#addClassA");
  buttonA.mousePressed(function() {
    addExample("A");
  });

  // When the B button is pressed, add the current frame
  // from the video with a label of "B" to the classifier
  buttonB = select("#addClassB");
  buttonB.mousePressed(function() {
    addExample("B");
  });

  // Reset buttons
  resetBtnA = select("#resetA");
  resetBtnA.mousePressed(function() {
    clearLabel("A");
  });

  resetBtnB = select("#resetB");
  resetBtnB.mousePressed(function() {
    clearLabel("B");
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
    }

    select("#confidenceA").html(`${confidences.A ? confidences.A * 100 : 0} %`);
    select("#confidenceB").html(`${confidences.B ? confidences.B * 100 : 0} %`);
  }

  classify();
}

// Update the example count for each label
function updateCounts() {
  const counts = knnClassifier.getCountByLabel();

  select("#exampleA").html(counts.A || 0);
  select("#exampleB").html(counts.B || 0);
}

// Clear the examples in one label
function clearLabel(classLabel) {
  knnClassifier.clearLabel(classLabel);
  updateCounts();
}

// Clear all the examples in all labels
function clearAllLabels() {
  knnClassifier.clearAllLabels();
  updateCounts();
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i += 1) {
    // For each pose detected, loop through all the keypoints
    const pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j += 1) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      const keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i += 1) {
    const skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j += 1) {
      const partA = skeleton[j][0];
      const partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}
