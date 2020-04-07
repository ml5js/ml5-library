let meta = {
  "inputUnits": [1],
  "outputUnits": 2,
  "inputs": { "direction": { "dtype": "number", "min": 0.1, "max": 0.9 } },
  "outputs": {
    "label": {
      "dtype": "string",
      "min": 0,
      "max": 1,
      "uniqueValues": ["left", "right"],
      "legend": { "left": [1,0], "right": [0,1]}
    }
  },
  "isNormalized": false
};

function setup() {
  // Options for Neural Network
  const options = {
    inputs: 1,
    outputs: 2,
    task: 'classification'
  }
  // Create Neural Network
  const nn = ml5.neuralNetwork(options);

  // nn.addData([0.1], ['left'])
  // nn.addData([0.9], ['right'])
  // nn.createMetaData(nn.neuralNetworkData.data.raw)
  
  nn.addDefaultLayers('classification', meta);
  nn.neuralNetworkData.meta = meta;
  console.log(nn)
  nn.classify([0.2], (err, result) => {
    if (err) console.log(err);
    console.log(result);
  });
}