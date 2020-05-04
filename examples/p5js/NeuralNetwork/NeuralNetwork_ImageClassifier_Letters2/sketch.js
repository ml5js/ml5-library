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
const IMAGE_WIDTH = 64;
const IMAGE_HEIGHT = 64;
const IMAGE_CHANNELS = 4;

let images;
let testA;

function preload() {
  images = [];
  for (let i = 1; i < 7; i++) {
    const a = loadImage(`images/A_0${i}.png`);
    const b = loadImage(`images/B_0${i}.png`);
    images.push({
      image: a,
      label: 'a'
    });
    images.push({
      image: b,
      label: 'b'
    });
  }

  testA = loadImage(`images/A_test.png`);
}

function setup() {
  const options = {
    task: 'imageClassification',
    debug: true,
    inputs: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS]
  };

  // construct the neural network
  nn = ml5.neuralNetwork(options);

  // add data
  for (let i = 0; i < images.length; i++) {
    const item = images[i];
    const labels = item.label;
    nn.addData({
      pixelArray: item.image
    }, {
      label: labels
    });
  }

  // normalize data
  nn.normalizeData();

  // train
  const TRAINING_OPTIONS = {
    batchSize: 2,
    epochs: 10
  };
  nn.train(TRAINING_OPTIONS, finishedTraining);
}

function finishedTraining() {
  console.log('finished training');
  // method 1: you can pass in an object with a matching key and the HTMLImageElement
  nn.classify({
    pixelArray: testA
  },
  gotResults
  );

  // method 2: you can pass in an array holding the HTMLImageElement
  nn.classify([testA], gotResults);
}

function gotResults(err, result) {
  if (err) {
    console.log(err);
    return;
  }
  console.log(result);
}