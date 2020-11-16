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
const width = 640;
const height = 480;
let canvas, ctx;

async function setup() {
  // Create a featureExtractor that can extract the already learned features from MobileNet
  featureExtractor = ml5.featureExtractor('MobileNet', modelReady);

  canvas = document.querySelector('#myCanvas');
  ctx = canvas.getContext('2d');

  posX = width / 2;
  posY = height / 2;
  
  // Create a video element
  video = await getVideo();

  // Create the UI buttons
  createButtons();
  
  requestAnimationFrame(draw);
}

setup();

function draw() {
  requestAnimationFrame(draw);
  // Flip the video from left to right, mirror the video
  // translate(width, 0)
  // scale(-1, 1);
  ctx.drawImage(video, 0, 0, width, height);

  // draw a square on the canvas
  ctx.beginPath()
  ctx.rect(posX, posY, squareSize, squareSize);
  ctx.fillStyle = "red";
  ctx.fill();
}

function modelReady(){
  document.querySelector('#status').textContent = 'FeatureExtractor(mobileNet model) Loaded'
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
  knnClassifier.classify(features, gotResults);
}

// A util function to create UI buttons
function createButtons() {
  // When the addClass1 button is pressed, add the current frame to class "Up"
  buttonA = document.querySelector('#addClass1');
  buttonA.addEventListener('click', function() {
    addExample('Up');
  });

  // When the addClass2 button is pressed, add the current frame to class "Right"
  buttonB = document.querySelector('#addClass2');
  buttonB.addEventListener('click', function() {
    addExample('Right');
  });

  // When the addClass3 button is pressed, add the current frame to class "Down"
  buttonC = document.querySelector('#addClass3');
  buttonC.addEventListener('click', function() {
    addExample('Down');
  });

  // When the addClass4 button is pressed, add the current frame to class "Left"
  buttonC = document.querySelector('#addClass4');
  buttonC.addEventListener('click', function() {
    addExample('Left');
  });

  // Predict button
  buttonPredict = document.querySelector('#buttonPredict');
  buttonPredict.addEventListener('click', classify);

  // Clear all classes button
  buttonClearAll = document.querySelector('#clearAll');
  buttonClearAll.addEventListener('click', clearAllLabels);
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
      document.querySelector('#confidence').textContent =`${confidences[result.label] * 100} %`;

      switch(result.label) {
      case 'Up':
        posY-=2;
        break;

      case 'Down':
        posY+=2;
        break;

      case 'Left':
        posX+=2;
        break;

      case 'Right':
        posX-=2;
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

  document.querySelector('#example1').textContent = counts.Up || 0;
  document.querySelector('#example2').textContent = counts.Right || 0;
  document.querySelector('#example3').textContent = counts.Down || 0;
  document.querySelector('#example4').textContent = counts.Left || 0;
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


// Helper Functions
async function getVideo(){
  // Grab elements, create settings, etc.
  const videoElement = document.createElement('video');
  videoElement.setAttribute("style", "display: none;"); 
  videoElement.width = width;
  videoElement.height = height;
  document.body.appendChild(videoElement);

  // Create a webcam capture
  const capture = await navigator.mediaDevices.getUserMedia({ video: true })
  videoElement.srcObject = capture;
  videoElement.play();

  return videoElement
}