/*
===
KNN Image Classifier Demo

Nov 2017
===
*/

let knn;
let video;
let buttonUp;
let buttonDown;
let buttonPredict;

function preload() {
  // Initialize the KNN method.
  knn = new p5ml.KNNImageClassifier(modelLoaded);
}

function setup() {
  createCanvas(320, 240).parent('canvasContainer');
  video = createCapture(VIDEO);
  background(0);
  video.attribute('width', 127);
  video.attribute('height', 127);
  video.hide();

  // Buttons
  buttonUp = createButton('Up');
  buttonUp.position(19, 19);
  buttonUp.mousePressed(() => {
    train(1)
  });

  buttonUp = createButton('Down');
  buttonUp.position(50, 19);
  buttonUp.mousePressed(() => {
    train(2)
  });

  buttonPredict = createButton('Predict');
  buttonPredict.position(260, 19);
  buttonPredict.mousePressed(predict);
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);
}

// A function to be called when the model has been loaded
function modelLoaded(){
  select('#loading').html('Model loaded!');
}

// Train the Classifier on a frame from the video.
function train(index) {
  let msg;
  if(index == 1){
    msg = 'up';
  } else if (index == 2){
    msg = 'down';
  }
  select('#training').html(msg);
  knn.addImage(video.elt, index);
}

// Predict the current frame.
function predict() {
  knn.predict(video.elt, gotResults);
}

// Show the results
function gotResults(results) {
  let msg;

  if(results.classIndex == 1){
    msg = 'up';
  } else if (results.classIndex == 2){
    msg = 'down';
  }
  select('#result').html(msg);
}