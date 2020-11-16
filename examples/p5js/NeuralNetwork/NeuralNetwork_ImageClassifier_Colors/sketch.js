// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Classification with Convolutional Neural Network
This example uses a callback pattern to create the classifier
=== */
let cnn;

function setup() {
  createCanvas(200, 200);
  const options = {
    inputs: [16, 16, 3],
    task: 'imageClassification',
    debug: true,
  };
  cnn = ml5.neuralNetwork(options);
  addData();
  cnn.train({ epochs: 50 }, finishedTraining);
}

function finishedTraining() {
  const r = random(255);
  const g = random(255);
  const b = random(255);
  background(r, g, b);
  const newPixels = [];
  for (let i = 0; i < 256; i += 1) {
    newPixels.push(r, g, b);
  }
  cnn.classify({ pixels: newPixels }, gotResults);
}

function gotResults(err, results) {
  if (err) {
    console.error(err);
  }
  console.log(results);
  const percent = 100 * results[0].confidence;
  createP(`${results[0].label} ${nf(percent, 2, 1)}%`);
}

function addData() {
  const redPixels = [];
  for (let i = 0; i < 256; i += 1) {
    redPixels.push(random(255), 0, 0);
  }

  const bluePixels = [];
  for (let i = 0; i < 256; i += 1) {
    bluePixels.push(0, 0, random(255));
  }

  const greenPixels = [];
  for (let i = 0; i < 256; i += 1) {
    greenPixels.push(0, random(255), 0);
  }

  cnn.addData({ pixels: redPixels }, { label: 'red' });
  cnn.addData({ pixels: bluePixels }, { label: 'blue' });
  cnn.addData({ pixels: greenPixels }, { label: 'green' });

  cnn.normalizeData();
}
