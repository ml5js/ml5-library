/*
===
Simple Teachable Machine (gif output) Demo

Nov 2017
===
*/

let knn;
let video;
let isPredicting = false;
let prevIsPredicting = false;
let exampleCounts = new Array(3).fill(0);
let timers = new Array(3);
let predictimer;
const msgArray = ['A', 'B', 'C'];
let outputSrc;
let updateGifIndex;
let uploadBtn;
let gifSrcs = ['output0.gif', 'output1.gif', 'output2.gif'];

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

  uploadBtn = createFileInput(imageUpload);
  uploadBtn.id('uploadbtn');
  uploadBtn.hide();

  // Train buttons
  msgArray.forEach((id, index) => {
    let button = select('#button' + id);
    button.mousePressed(() => {
      if (timers[index]) clearInterval(timers[index]);
      timers[index] = setInterval(() => { train(index); }, 100);
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
  knn.addImage(video.elt, category);
}

// Predict the current frame.
function predict() {
  knn.predict(video.elt, gotResults);
}

// Show the results
function gotResults(results) {
  if (results.classIndex < 0) return;

  // Update 'My guess is category: A/B/C'
  let msg = msgArray[results.classIndex];

  // Update 'My confidence is: 0 - 100%.'
  let comfidence = Math.max.apply(Math, results.confidences);
  select('#result').html(msg);
  select('#confidence').html(comfidence * 100 + '%');

  updateGif(results);

  if (isPredicting) predictimer = setTimeout(() => predict(), 50);
}

// Clears the saved images from the specified class.
function clearClass(classIndex) {
  knn.clearClass(classIndex);
}

function updateGif(results) {
  // Display different gifs
  if (results.classIndex < 0) return;
  if (outputSrc !== gifSrcs[results.classIndex]) {
    outputSrc = gifSrcs[results.classIndex];
    select('#output').elt.src = outputSrc;
  }
}

function updateExampleCounts() {
  let counts = knn.getClassExampleCount();
  exampleCounts = counts.slice(0, 3);
  exampleCounts.forEach((count, index) => {
    select('#example' + msgArray[index]).html(msgArray[index] + ' examples: ' + count);
  });

  updateIsPredicting();
}

function updateIsPredicting() {
  prevIsPredicting = isPredicting;
  isPredicting = exampleCounts.some(e => e > 0);
  if (prevIsPredicting !== isPredicting) {
    if (isPredicting) {
      predict();
    } else {
      clearTimeout(predictimer);
      resetResult();
    }
  }
}

function resetResult() {
  select('#result').html('...');
  select('#confidence').html('...');
  select('#output').elt.src = 'default.png';
}

function uploadGif(index) {
  updateGifIndex = index;
  console.log('uploadBtn: ', uploadBtn);
  console.log('updateGifIndex: ', updateGifIndex);
  uploadBtn.elt.click();
}

function imageUpload(file) {
  gifSrcs[updateGifIndex] = file.data;
  select('#img' + msgArray[updateGifIndex]).elt.src = file.data;
  select('#output').elt.src = file.data;
}

// TODO:
// output gif DONE
// mouse is press keep training DONE
// add example count DONE
// reset training, reset example count DONE
// automaticall start training when at least have one training data DONE

// be able to upload new gif
// overall layout, responsive
