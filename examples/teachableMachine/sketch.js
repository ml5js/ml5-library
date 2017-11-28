/*
===
Simple Teachable Machine (gif output) Demo

Nov 2017
===
*/

let knn;
let video;
let outputSrc;
let exampleCounts = new Array(3).fill(0);
let timers = new Array(3);
const msgArray = ['A', 'B', 'C'];

function preload() {
  // Initialize the KNN method.
  knn = new p5ml.KNNImageClassifier(modelLoaded);
}

function setup() {
  createCanvas(320, 240).parent('canvasContainer');
  background(0);
  video = createCapture(VIDEO);
  video.size(227, 227);
  video.hide();

  // Train buttons
  msgArray.forEach((id, index) => {
    let button = select('#button' + id);
    button.mousePressed(() => {
      if (timers[index]) clearInterval(timers[index]);
      timers[index] = setInterval(() => {
        train(index);
      }, 100);
    });
    button.mouseReleased(() => {
      if (timers[index]) {
        clearInterval(timers[index]);
        updateExampleCounts();
      }
    });
  });

  // Reset buttons
  msgArray.forEach((id, index) => {
    let button = select('#reset' + id);
    button.mousePressed(() => {
      clearClass(index);
      updateExampleCounts();
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
  exampleCounts = counts.slice(0, 3);
  exampleCounts.forEach((count, index) => {
    select('#example' + msgArray[index]).html(msgArray[index] + ' examples: ' + count);
  });
}

// Clears the saved images from the specified class.
function clearClass(classIndex) {
  knn.clearClass(classIndex);
}

// TODO:
// output gif DONE
// mouse is press keep training DONE
// add example count DONE
// reset training, reset example count DONE

// automaticall start training when at least have one training data
// be able to upload new gif
// overall layout, responsive
