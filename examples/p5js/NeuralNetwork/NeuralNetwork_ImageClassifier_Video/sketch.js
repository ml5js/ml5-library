// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Image classification using Convolutional Neural Network
This example uses a callback pattern to create the classifier
=== */
let classifier;
const IMAGE_WIDTH = 64;
const IMAGE_HEIGHT = 64;
const IMAGE_CHANNELS = 4;

let video;
let trainBtn;
let addDataBtn;
let labelInput;
let resultLabel;

function setup() {
  // load the pixels for each image to get a flat pixel array
  createCanvas(400, 400);

  video = createCapture(VIDEO);
  video.size(64, 64);

  trainBtn = createButton('train');
  trainBtn.mousePressed(train);
  addDataBtn = createButton('addData');
  addDataBtn.mousePressed(addData);
  resultLabel = createDiv('');
  labelInput = createInput('label');

  const options = {
    task: 'imageClassification',
    debug: true,
    inputs: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
  };

  // construct the neural network
  classifier = ml5.neuralNetwork(options);
  
  // An option to load sample data for quick testing
  // classifier.loadData('daytime_nightime.json', train);
}

function draw() {
  image(video, 0, 0, width, height);
}

function addData() {
  console.log('adding data', labelInput.value());
  classifier.addData({ image: video }, { label: labelInput.value() });
}

function train() {
  const TRAINING_OPTIONS = {
    batchSize: 16,
    epochs: 4,
  };

  classifier.normalizeData();
  classifier.train(TRAINING_OPTIONS, finishedTraining);
}

function finishedTraining() {
  console.log('finished training');
  classifier.classify([video], gotResults);
}

function gotResults(err, result) {
  if (err) {
    console.log(err);
    return;
  }
  resultLabel.html(`${result[0].label}`);
  classifier.classify([video], gotResults);
}
