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
let positionX = 140;

function setup() {
  createCanvas(340, 280);
  // Create a video element
  video = createCapture(VIDEO);
  // Append it to the videoContainer DOM element
  video.hide();
  // Extract the features from MobileNet
  featureExtractor = ml5.featureExtractor("MobileNet", modelReady);
  // Create a new regressor using those features and give the video we want to use
  regressor = featureExtractor.regression(video, videoReady);
  // Create the UI buttons
  setupButtons();
}

function draw() {
  image(video, 0, 0, 340, 280);
  noStroke();
  fill(255, 0, 0);
  rect(positionX, 120, 50, 50);
}

// A function to be called when the model has been loaded
function modelReady() {
  select("#modelStatus").html("Model loaded!");
}

// A function to be called when the video has loaded
function videoReady() {
  select("#videoStatus").html("Video ready!");
}

// Classify the current frame.
function predict() {
  regressor.predict(gotResults);
}

// A util function to create UI buttons
function setupButtons() {
  slider = select("#slider");
  // When the Dog button is pressed, add the current frame
  // from the video with a label of "dog" to the classifier
  select("#addSample").mousePressed(function() {
    regressor.addImage(slider.value());
    select("#amountOfSamples").html((samples += 1));
  });

  // Train Button
  select("#train").mousePressed(function() {
    regressor.train(function(lossValue) {
      if (lossValue) {
        loss = lossValue;
        select("#loss").html(`Loss: ${loss}`);
      } else {
        select("#loss").html(`Done Training! Final Loss: ${loss}`);
      }
    });
  });

  // Predict Button
  select("#buttonPredict").mousePressed(predict);
}

// Show the results
function gotResults(err, result) {
  if (err) {
    console.error(err);
  }
  if (result && result.value) {
    positionX = map(result.value, 0, 1, 0, width);
    slider.value(result.value);
    predict();
  }
}
