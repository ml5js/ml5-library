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

function setup() {
  const options = {
    task: "classification",
  };
  nn = ml5.neuralNetwork(options);

  addData();

  nn.normalizeData();

  // train the model
  const trainingOptions = {
    batchSize: 32,
    epochs: 10,
  };
  nn.train(trainingOptions, finishedTraining);
}

function addData() {
  for (let i = 0; i < 500; i += 1) {
    let xVal, labelVal;
    if (i < 250) {
      xVal = i;
      labelVal = "a";
    } else {
      xVal = i;
      labelVal = "b";
    }
    const yVal = floor(random(500));

    nn.addData({ x: xVal, y: yVal }, { label: labelVal });
  }
}

function finishedTraining() {
  console.log("done");

  nn.classify({ x: 0, y: 0.5 }, function(err, result) {
    if (err) {
      console.log(err);
      return;
    }
    console.log("hi from callback", result);
  });
}
