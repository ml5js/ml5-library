/*
===
Simple Teachable Machine (gif output) Demo

Nov 2017
===
*/

let knn;
let video;
let outputSrc;
let exampleCounts = [0, 0, 0];
const msgArray = ['A', 'B', 'C'];

function preload() {
  // Initialize the KNN method.
  knn = new p5ml.KNNImageClassifier(modelLoaded);
}

function setup() {
  createCanvas(320, 240).parent('canvasContainer');
  video = createCapture(VIDEO);
  background(0);
  video.size(227, 227);
  video.hide();

  // Buttons
  msgArray.forEach((id, index) => {
    let button = select('#button' + id);
    button.mousePressed(() => {
      train(index);
    });
  });

  let buttonPredict = select('#buttonPredict');
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
  let msg = msgArray[category];
  select('#training').html(msg);

  knn.addImage(video.elt, category);

  exampleCounts[category]++;
  select('#example' + msgArray[category]).html('example ' + msgArray[category] + ': ' + exampleCounts[category]);
}

// Predict the current frame.
function predict() {
  knn.predict(video.elt, gotResults);
}

// Show the results
function gotResults(results) {
  // Update 'My guess is category: A/B/C'
  let msg = msgArray[results.classIndex];

  // Update 'My confidence is: 0 - 100%.'
  let comfidence = Math.max.apply(Math, results.confidences);
  select('#result').html(msg);
  select('#confidence').html(comfidence * 100 + '%');

  updateGif(results);
  updateExampleCounts();

  setTimeout(() => predict(), 50);
}

function updateGif(results) {
  // Display different gifs
  if (outputSrc !== 'output' + results.classIndex + '.gif') {
    outputSrc = 'output' + results.classIndex + '.gif';
    select('#output').elt.src = outputSrc;
  }
}

function updateExampleCounts() {
  let counts = knn.getClassExampleCount();
  console.log(counts);
}

// TODO:
// output gif

// mouse is press keep training
// add example count
// reset training
// overall layout, responsive
// automaticall start training when at least have one training data
// be able to upload new gif
