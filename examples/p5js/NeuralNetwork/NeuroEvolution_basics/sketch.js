let meta = {
  "inputUnits": [1],
  "outputUnits": 2,
  "inputs": { 0: { "dtype": "number" } },
  "outputs": {
    "label": {
      "dtype": "string",
      "legend": { 'jump': [1,0], 'no jump': [0,1] }
    }
  },
  "isNormalized": false
};
function setup() {
  const options = {
    inputs: 1,
    outputs: 2,
    task: 'classification'
  }
  const nn = ml5.neuralNetwork(options);
  nn.addDefaultLayers('classification', meta);
  nn.neuralNetworkData.meta = meta;
  let results = nn.classifySync([0.2]);
  console.log(results);
  // nn.classify([0.2], (err, result) => {
  //   if (err) console.log(err);
  //   console.log(result);
  // });
}