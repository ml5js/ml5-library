// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Image classification using MobileNet and p5.js
This example uses a callback pattern to create the classifier
// x: population_cdp
// y: scope1_ghg_emissions_tons_co2e
=== */
let nn;

let counter = 0;
const testInputs = [100, 50000, 100000, 500000, 2500000, 5000000, 10000000, 15000000];

// Options for Neural Network
const options = {
  inputs: ["population_cdp"],
  outputs: ["scope1_ghg_emissions_tons_co2e"],
  dataUrl: "data/co2stats.csv",
  task: "regression",
  debug: true,
};

function setup() {
  createCanvas(400, 400);
  // background(0, 27, 68);
  background(244, 244, 244);

  // Step 1: Create Neural Network
  nn = ml5.neuralNetwork(options, modelLoaded);
}

function modelLoaded() {
  nn.normalizeData();

  // visualize the training data
  nn.data.training.forEach(row => {
    const { xs, ys } = row;
    const x = map(xs.population_cdp, 0, 1, 0, width);
    const y = map(ys.scope1_ghg_emissions_tons_co2e, 0, 1, height, 0);
    ellipse(x, y, 2, 2);
  });

  const trainingOptions = {
    epochs: 50,
    batchSize: 12,
  };
  nn.train(trainingOptions, finishedTraining);
}

function finishedTraining() {
  if (counter < testInputs.length) {
    const input = testInputs[counter];
    nn.predict([input], (err, result) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(result);
      const { inputs, outputs } = nn.neuralNetworkData.meta;

      const inputMin = inputs.population_cdp.min;
      const inputMax = inputs.population_cdp.max;
      const outputMin = outputs.scope1_ghg_emissions_tons_co2e.min;
      const outputMax = outputs.scope1_ghg_emissions_tons_co2e.max;

      const x = map(input, inputMin, inputMax, 0, width);
      const y = map(result[0].value, outputMin, outputMax, height, 0);

      rectMode(CENTER);
      fill(255, 0, 0);
      text(`pop:${input}`, x, y);
      text(`tons_co2e:${result[0].value}`, x, y + 10);
      rect(x, y, 6, 6);

      counter += 1;
      finishedTraining();
    });
  }
}
