// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Image Classification using Feature Extraction with MobileNet. Built with p5.js
This example uses a callback pattern to create the classifier
=== */

let featureExtractor;
let classifier;
let video;
let loss;
let dogImages = 0;
let catImages = 0;
let badgerImages = 0;

function setup() {
  noCanvas();
  // Create a video element
  video = createCapture(VIDEO);
  video.parent("videoContainer");
  video.size(320, 240);

  // Extract the already learned features from MobileNet
  featureExtractor = ml5.featureExtractor("MobileNet", modelReady);

  // Create a new classifier using those features and give the video we want to use
  const options = { numLabels: 3 };
  classifier = featureExtractor.classification(video, options);
  // Set up the UI buttons
  setupButtons();
}

// A function to be called when the model has been loaded
function modelReady() {
  select("#modelStatus").html("MobileNet Loaded!");
  // If you want to load a pre-trained model at the start
  // classifier.load('./model/model.json', function() {
  //   select('#modelStatus').html('Custom Model Loaded!');
  // });
}

// Classify the current frame.
function classify() {
  classifier.classify(gotResults);
}

// A util function to create UI buttons
function setupButtons() {
  // When the Cat button is pressed, add the current frame
  // from the video with a label of "cat" to the classifier
  buttonA = select("#catButton");
  buttonA.mousePressed(function() {
    classifier.addImage("cat");
    select("#amountOfCatImages").html((catImages += 1));
  });

  // When the Dog button is pressed, add the current frame
  // from the video with a label of "dog" to the classifier
  buttonB = select("#dogButton");
  buttonB.mousePressed(function() {
    classifier.addImage("dog");
    select("#amountOfDogImages").html((dogImages += 1));
  });

  // When the Dog button is pressed, add the current frame
  // from the video with a label of "dog" to the classifier
  buttonC = select("#badgerButton");
  buttonC.mousePressed(function() {
    classifier.addImage("badger");
    select("#amountOfBadgerImages").html((badgerImages += 1));
  });

  // Train Button
  train = select("#train");
  train.mousePressed(function() {
    classifier.train(function(lossValue) {
      if (lossValue) {
        loss = lossValue;
        select("#loss").html(`Loss: ${loss}`);
      } else {
        select("#loss").html(`Done Training! Final Loss: ${loss}`);
      }
    });
  });

  // Predict Button
  buttonPredict = select("#buttonPredict");
  buttonPredict.mousePressed(classify);

  // Save model
  saveBtn = select("#save");
  saveBtn.mousePressed(function() {
    classifier.save();
  });

  // Load model
  loadBtn = select("#load");
  loadBtn.changed(function() {
    classifier.load(loadBtn.elt.files, function() {
      select("#modelStatus").html("Custom Model Loaded!");
    });
  });
}

// Show the results
function gotResults(err, results) {
  // Display any error
  if (err) {
    console.error(err);
  }
  if (results && results[0]) {
    select("#result").html(results[0].label);
    select("#confidence").html(`${results[0].confidence.toFixed(2) * 100  }%`);
    classify();
  }
}
