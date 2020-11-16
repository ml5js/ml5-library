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
let counter = 0;

const options = {
  task: "regression",
  debug: true,
};

function setup() {
  createCanvas(400, 400);
  nn = ml5.neuralNetwork(options);

  console.log(nn);
  createTrainingData();
  nn.normalizeData();

  const trainingOptions = {
    batchSize: 24,
    epochs: 10,
  };

  nn.train(trainingOptions, finishedTraining); // if you want to change the training options
  // nn.train(finishedTraining); // use the default training options
}

function finishedTraining() {
  if (counter < 400) {
    nn.predict([counter], (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(results[0]);
      const prediction = results[0];
      const x = counter;
      const y = prediction.value;
      fill(255, 0, 0);
      rectMode(CENTER);
      rect(x, y, 10, 10);

      counter += 1;
      finishedTraining();
    });
  }
}

function createTrainingData() {
  for (let i = 0; i < width; i += 10) {
    const iters = floor(random(5, 20));
    const spread = 50;
    for (let j = 0; j < iters; j += 1) {
      const data = [i, height - i + floor(random(-spread, spread))];
      fill(0, 0, 255);
      ellipse(data[0], data[1], 10, 10);
      nn.addData([data[0]], [data[1]]);
    }
  }
}
