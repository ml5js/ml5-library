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

const options = {
  inputs: 1,
  outputs: 2,
  task: 'classification',
  debug: true
}

function setup(){
  createCanvas(400, 400);
  nn = ml5.neuralNetwork(options);


  console.log(nn)
  createTrainingData();
  nn.normalizeData();

  const trainingOptions={
    batchSize: 24,
    epochs: 32
  }
  
  nn.train(trainingOptions,finishedTraining); // if you want to change the training options
  // nn.train(finishedTraining); // use the default training options
}

function finishedTraining(){

  nn.classify([300], function(err, result){
    console.log(result);
  })
  
}

function createTrainingData(){
  for(let i = 0; i < 400; i += 1){
    if(i%2 === 0){
      const x = random(0, width/2);
      nn.addData( [x],  ['left'])
    } else {
      const x = random(width/2, width);
      nn.addData( [x],  ['right'])
    }
  }
}
