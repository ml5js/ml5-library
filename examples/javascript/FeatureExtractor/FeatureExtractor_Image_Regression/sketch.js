// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Creating a regression extracting features of MobileNet. Build with p5js.
=== */

let featureExtractor;
let regressor;
let video;
let loss;
let slider;
let samples = 0;
let ctx;
const width = 640;
const height = 480;
let positionX = width / 2;

function map(n, start1, stop1, start2, stop2) {
  const newval = ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
  return newval;
}

async function setup() {
  canvas = document.querySelector("#myCanvas");
  ctx = canvas.getContext("2d");
  // Create a video element
  video = await getVideo();
  // Extract the features from MobileNet
  featureExtractor = ml5.featureExtractor("MobileNet", modelReady);
  // Create a new regressor using those features and give the video we want to use
  regressor = featureExtractor.regression(video, videoReady);
  // Create the UI buttons
  setupButtons();
  requestAnimationFrame(draw);
}
setup();

function draw() {
  requestAnimationFrame(draw);

  ctx.drawImage(video, 0, 0, width, height);

  ctx.beginPath();
  ctx.rect(positionX, 120, 100, 100);
  ctx.fillStyle = "red";
  ctx.fill();
}

// A function to be called when the model has been loaded
function modelReady() {
  document.querySelector("#modelStatus").textContent = "Model loaded!";
}

// A function to be called when the video has loaded
function videoReady() {
  document.querySelector("#videoStatus").textContent = "Video ready!";
}

// Classify the current frame.
function predict() {
  regressor.predict(gotResults);
}

// A util function to create UI buttons
function setupButtons() {
  slider = document.querySelector("#slider");
  // When the Dog button is pressed, add the current frame
  // from the video with a label of "dog" to the classifier
  document.querySelector("#addSample").addEventListener("click", function() {
    regressor.addImage(parseFloat(slider.value));
    document.querySelector("#amountOfSamples").textContent = samples += 1;
  });

  // Train Button
  document.querySelector("#train").addEventListener("click", function() {
    regressor.train(function(lossValue) {
      if (lossValue) {
        loss = lossValue;
        document.querySelector("#loss").textContent = `Loss: ${loss}`;
      } else {
        document.querySelector("#loss").textContent = `Done Training! Final Loss: ${loss}`;
      }
    });
  });

  // Predict Button
  document.querySelector("#buttonPredict").addEventListener("click", predict);
}

// Show the results
function gotResults(err, result) {
  if (err) {
    console.error(err);
  }
  if (result && result.value) {
    positionX = map(result.value, 0, 1, 0, width);
    slider.value = result.value;
    predict();
  }
}

// Helper Functions
async function getVideo() {
  // Grab elements, create settings, etc.
  const videoElement = document.createElement("video");
  videoElement.setAttribute("style", "display: none;");
  videoElement.width = width;
  videoElement.height = height;
  document.body.appendChild(videoElement);

  // Create a webcam capture
  const capture = await navigator.mediaDevices.getUserMedia({ video: true });
  videoElement.srcObject = capture;
  videoElement.play();

  return videoElement;
}
