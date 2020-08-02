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
const width = 640;
const height = 480;

// adapted from https://github.com/IDMNYU/p5.js-speech/blob/master/lib/p5.speech.js
class MySpeech {
  constructor() {
    this.interrupt = false;
    // make an utterance to use with this synthesizer:
    this.utterance = new SpeechSynthesisUtterance();
    // make a speech synthizer (this will load voices):
    this.synth = window.speechSynthesis;
  }

  speak(_phrase) {
    if (this.interrupt) this.synth.cancel();
    this.utterance.text = _phrase;

    this.synth.speak(this.utterance);
  }

  ended(_cb) {
    this.onEnd = _cb;
  }
}

async function setup() {
  // Create a camera input
  video = await getVideo();

  myVoice = new MySpeech();
  // Initialize the Image Classifier method with MobileNet and the video as the second argument
  classifier = ml5.imageClassifier("MobileNet", video, modelReady);
}

setup();

function modelReady() {
  // Change the status of the model once its ready
  document.querySelector("#status").textContent = "Model Loaded";
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
  document.querySelector("#result").textContent = results[0].label;
  document.querySelector("#probability").textContent = results[0].confidence.toFixed(4);
  myVoice.speak(`I see ${results[0].label}`);
  classifyVideo();
}

// Helper Functions
async function getVideo() {
  // Grab elements, create settings, etc.
  const videoElement = document.createElement("video");
  // videoElement.setAttribute("style", "display: none;");
  videoElement.width = width;
  videoElement.height = height;
  document.body.appendChild(videoElement);

  // Create a webcam capture
  const capture = await navigator.mediaDevices.getUserMedia({ video: true });
  videoElement.srcObject = capture;
  videoElement.play();

  return videoElement;
}
