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
let canvas, ctx;
const width = 640;
const height = 480;

// adapted from https://github.com/IDMNYU/p5.js-speech/blob/master/lib/p5.speech.js
class MySpeech {
  constructor(){
    this.interrupt = false;
    // make an utterance to use with this synthesizer:
    this.utterance = new SpeechSynthesisUtterance();
    // make a speech synthizer (this will load voices):
    this.synth = window.speechSynthesis;
  }

  speak(_phrase){
    if(this.interrupt) this.synth.cancel();
    this.utterance.text = _phrase;

    this.synth.speak(this.utterance);
  }
}

async function setup() {
  canvas = document.querySelector('#myCanvas');
  ctx = canvas.getContext('2d');
  // Create a featureExtractor that can extract the already learned features from MobileNet
  featureExtractor = ml5.featureExtractor('MobileNet', modelReady);
  // Create a video element
  video = await getVideo();
  // Create the UI buttons
  createButtons();
  // Speech synthesis object
  myVoice = new MySpeech();
  // The speak() method will interrupt existing speech currently being synthesized.
  myVoice.interrupt = true;

  requestAnimationFrame(draw)
}

setup();

function draw(){
  requestAnimationFrame(draw)

  ctx.drawImage(video, 0,0, width, height);
}

function modelReady() {
  document.querySelector('#status').textContent = 'FeatureExtractor(mobileNet model) Loaded';
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
  buttonA = document.querySelector('#addClass1');
  buttonA.addEventListener('click', function() {
    addExample('Hello');
  });

  // When the B button is pressed, add the current frame to class "goodbye"
  buttonB = document.querySelector('#addClass2');
  buttonB.addEventListener('click', function() {
    addExample('Goodbye');
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
      document.querySelector('#confidence').textContent = `${confidences[result.label] * 100} %`;

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

  document.querySelector('#example1').textContent = counts.Hello || 0;
  document.querySelector('#example2').textContent = counts.Goodbye || 0;
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