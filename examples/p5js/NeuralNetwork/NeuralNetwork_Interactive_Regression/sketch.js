const trainData = [];
let neuralNetwork;

// selectors for inputs and button
const inputNeuralNetworkLearningRate = document.getElementById("neuralNetworkLearningRate");
const inputNeuralNetworkHiddenUnits = document.getElementById("neuralNetworkHiddenUnits");
const inputTrainEpochs = document.getElementById("trainEpochs");
const inputTrainBatchSize = document.getElementById("trainBatchSize");
const buttonStartTrain = document.getElementById("startTraining");

const canvasSize = 800;

// options for NeuralNetwork
const options = {
  inputs: 1,
  outputs: 1,
  debug: true,
  task: "regression",
  learningRate: 0.25,
  hiddenUnits: 20,
};

// training params
const trainParams = {
  validationSplit: 0,
  epochs: 100,
  batchSize: 64,
};

buttonStartTrain.addEventListener("click", () => {
  // get input data
  options.learningRate = parseFloat(inputNeuralNetworkLearningRate.value, 10);
  options.hiddenUnits = parseInt(inputNeuralNetworkHiddenUnits.value, 10);
  trainParams.epochs = parseInt(inputTrainEpochs.value, 10);
  trainParams.batchSize = parseInt(inputTrainBatchSize.value, 10);

  // and start the training
  startTraining();
});

function setup() {
  createCanvas(canvasSize, canvasSize);
  background(220);
}

function mouseClicked() {
  if (mouseY > 50) {
    circle(mouseX, mouseY, 10);
    trainData.push([mouseX, mouseY]);
  }
}

function startTraining() {
  // check if train data
  if (trainData.length === 0) {
    // eslint-disable-next-line no-alert
    alert("Please add some training data by clicking inside the canvas");
    return;
  }

  neuralNetwork = ml5.neuralNetwork(options);

  // add training data
  for (let i = 0; i < trainData.length; i += 1) {
    neuralNetwork.addData([trainData[i][0]], [trainData[i][1]]);
  }

  neuralNetwork.normalizeData();
  neuralNetwork.train(trainParams, doneTraining);
}

function doneTraining() {
  // build x-bases to calculate corresponding y-values. We take every x-value possible of the canvas to make it look like a line
  xMany = [];
  for (x = 0; x <= canvasSize; x += 1) {
    xMany.push([x]);
  }

  // predict corresponding y-values and show as circle
  neuralNetwork.predictMultiple(xMany, (error, results) => {
    if (error) {
      console.log(error);
    } else {
      console.log(results);
      for (let i = 0; i < results.length; i += 1) {
        x = xMany[i][0];
        y = results[i][0].value;
        circle(x, y, 1);
      }
    }
  });
}
