/*
===
KNN Image Classifier Demo
===
*/

let knn;
let video;

function preload() {
  // Initialize the KNN method.
  knn = new p5ml.KNNImageClassifier(modelLoaded, 2, 1);
}

function setup() {
  createCanvas(320, 240).parent('canvasContainer');
  video = createCapture(VIDEO);
  background(0);
  video.size(227, 227);
  video.hide();

  // Train buttons
  buttonA = select('#buttonA');
  buttonA.mousePressed(() => {
    train(1);
  });

  buttonB = select('#buttonB');
  buttonB.mousePressed(() => {
    train(2);
  });

  // Reset buttons
  resetBtnA = select('#resetA');
  resetBtnA.mousePressed(() => {
    clearClass(1);
    updateExampleCounts();
  });

  resetBtnB = select('#resetB');
  resetBtnB.mousePressed(() => {
    clearClass(2);
    updateExampleCounts();
  });

  buttonPredict = select('#buttonPredict');
  buttonPredict.mousePressed(predict);
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);
}

// A function to be called when the model has been loaded
function modelLoaded() {
  select('#loading').html('Model loaded!');
}

// Train the Classifier on a frame from the video.
function train(category) {
  let msg;
  if (category == 1) {
    msg = 'A';
  } else if (category == 2) {
    msg = 'B';
  }
  select('#training').html(msg);
  knn.addImage(video.elt, category);
  updateExampleCounts();
}

// Predict the current frame.
function predict() {
  knn.predict(video.elt, gotResults);
}

// Show the results
function gotResults(results) {
  let msg;

  if (results.classIndex == 1) {
    msg = 'A';
  } else if (results.classIndex == 2) {
    msg = 'B';
  }
  select('#result').html(msg);

  // Update confidence
  select('#confidenceA').html(results.confidences[1]);
  select('#confidenceB').html(results.confidences[2]);

  setTimeout(() => predict(), 50);
}

// Clear the data in one class
function clearClass(classIndex) {
  knn.clearClass(classIndex);
}

// Update the example count for each class
function updateExampleCounts() {
  let counts = knn.getClassExampleCount();
  select('#exampleA').html(counts[1]);
  select('#exampleB').html(counts[2]);
}
