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
let currentWord;
let currentIndex = 0;
let isPlaying = false;
const words = ["banana", "watch", "shoe", "book", "cellphone", "keyboard", "shirt", "pants", "cup"];
const width = 640;
const height = 480;
let result;

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

let myVoice;

async function setup() {
  // Create a camera input
  video = await getVideo();
  // Initialize the Image Classifier method with MobileNet and the video as the second argument
  classifier = ml5.imageClassifier("MobileNet", video, modelReady);

  // Create a new p5.speech object
  // You can also control the Language, Rate, Pitch and Volumn of the voice
  // Read more at http://ability.nyu.edu/p5.js-speech/
  myVoice = new MySpeech();

  document.querySelector("#start").addEventListener("click", function() {
    playNextWord();
  });

  document.querySelector("#next").addEventListener("click", function() {
    currentIndex += 1;
    if (currentIndex >= words.length) {
      currentIndex = 0;
    }
    playNextWord();
  });

  // speechEnded function will be called when an utterance is finished
  // Read more at p5.speech's onEnd property: http://ability.nyu.edu/p5.js-speech/
  myVoice.onEnd = speechEnded;
}

setup();

function playNextWord() {
  isPlaying = true;
  currentWord = words[currentIndex];
  document.querySelector("#instruction").textContent = `Go find ${currentWord}!`;
  // Call the classifyVideo function to start classifying the video
  classifyVideo();
}

function modelReady() {
  // Change the status of the model once its ready
  document.querySelector("#status").textContent = "Model Loaded";
}

// Get a prediction for the current video frame
function classifyVideo() {
  classifier.classify(gotResult);
}

// When we get a result
function gotResult(err, results) {
  // The results are in an array ordered by confidence.
  // Get the first result string
  result = results[0].label;
  // Split the first result string by coma and get the first word
  const oneWordRes = result.split(",")[0];
  // Get the top 3 results as strings in an array
  // Read more about map function here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
  const top3Res = results.map(r => r.label);
  // Find if any of the top 3 result strings includes the current word
  // Read more about find function here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
  const ifFound = top3Res.find(r => r.includes(currentWord));
  if (ifFound) {
    // If top 3 results includes the current word
    isPlaying = false;
    document.querySelector("#message").textContent = `You found ${currentWord}!`;
    myVoice.speak(`You found ${currentWord}!`);
  } else {
    document.querySelector("#message").textContent = `I see ${oneWordRes}`;
    myVoice.speak(`I see ${oneWordRes}`);
  }
  classifyVideo();
}

function speechEnded() {
  if (isPlaying) classifyVideo();
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
