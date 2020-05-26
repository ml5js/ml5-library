let neuralNetwork;
let submitButton;

function setup() {
  noCanvas();

  const nnOptions = {
    dataUrl: "data/titanic_cleaned.csv",
    inputs: ["fare_class", "sex", "age", "fare"],
    outputs: ["survived"],
    task: "classification",
    debug: true,
  };

  neuralNetwork = ml5.neuralNetwork(nnOptions, modelReady);
  submitButton = select("#submit");
  submitButton.mousePressed(classify);
  submitButton.hide();
}

function modelReady() {
  neuralNetwork.normalizeData();
  neuralNetwork.train({ epochs: 50 }, whileTraining, finishedTraining);
}

function whileTraining(epoch, logs) {
  console.log(`Epoch: ${epoch} - loss: ${logs.loss.toFixed(2)}`);
}

function finishedTraining() {
  console.log("done!");
  submitButton.show();
  classify();
}

// TODO: normalize and encode values going into predict?
function classify() {
  const age = parseInt(select("#age").value(), 10);
  const fare = parseInt(select("#fare").value(), 10);
  const fareClass = select("#fare_class").value();
  const sex = select("#sex").value();

  // let inputs = {
  //   age: age,
  //   fare: fare,
  //   fare_class: fare_class,
  //   sex: sex
  // };

  const inputs = [fareClass, sex, age, fare];
  neuralNetwork.classify(inputs, gotResults);
}

function gotResults(err, results) {
  if (err) {
    console.error(err);
  } else {
    console.log(results);
    select("#result").html(`prediction: ${results[0].label}`);
  }
}
