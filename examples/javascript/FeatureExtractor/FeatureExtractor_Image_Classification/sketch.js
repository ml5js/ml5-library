// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Image Classification using Feature Extractor with MobileNet
=== */

// Grab all the DOM elements
var video = document.getElementById('video');
var videoStatus = document.getElementById('videoStatus');
var loading = document.getElementById('loading');
var catButton = document.getElementById('catButton');
var dogButton = document.getElementById('dogButton');
var amountOfCatImages = document.getElementById('amountOfCatImages');
var amountOfDogImages = document.getElementById('amountOfDogImages');
var train = document.getElementById('train');
var loss = document.getElementById('loss');
var result = document.getElementById('result');
var confidence = document.getElementById('confidence');
var predict = document.getElementById('predict');

// A variable to store the total loss
let totalLoss = 0;

// Create a webcam capture
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
    video.play();
  })

// A function to be called when the model has been loaded
function modelLoaded() {
  loading.innerText = 'Model loaded!';
}

// Extract the already learned features from MobileNet
const featureExtractor = ml5.featureExtractor('MobileNet', modelLoaded);
// Create a new classifier using those features
const classifier = featureExtractor.classification(video, videoReady);

// Predict the current frame.
function predict() {
  classifier.predict(gotResults);
}

// A function to be called when the video is finished loading
function videoReady() {
  videoStatus.innerText = 'Video ready!';
}

// When the Cat button is pressed, add the current frame
// from the video with a label of cat to the classifier
catButton.onclick = function () {
  classifier.addImage('cat');
  amountOfCatImages.innerText = Number(amountOfCatImages.innerText) + 1;
}

// When the Cat button is pressed, add the current frame
// from the video with a label of cat to the classifier
dogButton.onclick = function () {
  classifier.addImage('dog');
  amountOfDogImages.innerText = Number(amountOfDogImages.innerText) + 1;
}

// When the train button is pressed, train the classifier
// With all the given cat and dog images
train.onclick = function () {
  classifier.train(function(lossValue) {
    if (lossValue) {
      totalLoss = lossValue;
      loss.innerHTML = 'Loss: ' + totalLoss;
    } else {
      loss.innerHTML = 'Done Training! Final Loss: ' + totalLoss;
    }
  });
}

// Show the results
function gotResults(err, results) {
  // Display any error
  if (err) {
    console.error(err);
  }
  if (results && results[0]) {
    result.innerText = results[0].label;
    confidence.innerText = results[0].confidence;
    classifier.classify(gotResults);
  }
}

// Start predicting when the predict button is clicked
predict.onclick = function () {
  classifier.classify(gotResults);
}
