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
    task: 'imageClassification',
    inputs: [2, 2, 4],
    debug: true
  }
  nn = ml5.neuralNetwork(options);

  addData();
  nn.train({
    epochs: 20,
    batchSize: 2
  }, finishedTraining)

}

function finishedTraining() {
  nn.classify([
    0, 0, 255, 255, 0, 0, 255, 255,
    0, 0, 255, 255, 0, 0, 255, 255
  ], gotResults)

}

function gotResults(err, result) {
  if (err) {
    console.error(err)
  }
  console.log(result)
}

function addData() {
  const myData = [{
    label: "red-square",
    value: [
      255, 0, 0, 255, 255, 0, 0, 255,
      255, 0, 0, 255, 255, 0, 0, 255
    ]
  },
  {
    label: "green-square",
    value: [
      0, 255, 0, 255, 0, 255, 0, 255,
      0, 255, 0, 255, 0, 255, 0, 255
    ]
  },
  {
    label: "blue-square",
    value: [
      0, 0, 255, 255, 0, 0, 255, 255,
      0, 0, 255, 255, 0, 0, 255, 255
    ]
  }

  ]

  // method 1: adding data as objects
  for(let i = 0; i < myData.length; i++){
    const item = myData[i];
    const xInputObj = {
      pixelArray: item.value
    }

    const yInputObj = {
      label: item.label
    }
    nn.addData(xInputObj, yInputObj)
  }

  
  // method 2:adding data as arrays with
  const labelsOptions = {
    inputLabels: ['pixelArray'],
    outputLabels: ['label']
  }
  for(let i = 0; i < myData.length; i++){
    const item = myData[i]; 
    nn.addData([item.value], [item.label], labelsOptions)
  }
}