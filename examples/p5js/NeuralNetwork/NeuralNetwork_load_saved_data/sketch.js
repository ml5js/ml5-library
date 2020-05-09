// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Image classification using MobileNet and p5.js
This example uses a callback pattern to create the classifier
=== */
let nn;
let resultsText;
function setup() {
  // Options for Neural Network
  createCanvas(400, 400);
  const options = {
    inputs: ['x', 'y'],
    outputs: ['label'],
    task: 'classification',
    debug: true
  };
  // Create Neural Network
  nn = ml5.neuralNetwork(options);

  // trainModel();
  resultsText = select('#results');

  // Train the model
  const trainBtn = select('#trainBtn');
  // trainBtn.position(10, 50);
  trainBtn.mousePressed(function () {
    trainModel();
  });

  // Save and download the model
  // let saveBtn = createButton('Save Model');
  // saveBtn.position(10, 90);
  // saveBtn.mousePressed(function () {
  //   nn.save();
  // });

  // // Load the model from local files
  // let loadLocalBtn = createButton('Load the model from local files');
  // loadLocalBtn.position(10, 110);
  // loadLocalBtn.mousePressed(function () {
  //   nn.load('model/model.json', function () {
  //     console.log('Model Loaded!');
  //   });
  // });

  // Load Data
  const loadBtn = select('#load');
  loadBtn.changed(function () {
    nn.loadData(loadBtn.elt.files, function () {
      console.log('Data Loaded!');
    });
  });
}

function draw(){
  background(240);
}

function trainModel() {
  
  const trainingOptions = {
    epochs: 32,
    batchSize: 12
  }
  // Train
  nn.normalizeData();
  nn.train(trainingOptions, finishedTraining);
}

// Training callback
function finishedTraining() {
  classify();
}

function classify() {
  nn.classify({x:mouseX, y:mouseY}, gotResults);
}

function gotResults(error, results) {
  if (error) console.log(error);
  if (results) {
    // console.log(results)
    resultsText.html(`${results[0].label}`)
    classify();
  }
}