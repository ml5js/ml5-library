<<<<<<< HEAD
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
=======
// let meta = {
//   "inputUnits": [3],
//   "outputUnits": 2,
//   "inputs": {
//     0: {
//       "dtype": "number"
//     },
//     1: {
//       "dtype": "number"
//     },
//     2: {
//       "dtype": "number"
//     }
//   },
//   "outputs": {
//     "label": {
//       "dtype": "string",
//       "legend": {
//         'yes': [1, 0],
//         'no': [0, 1]
//       }
//     }
//   },
//   "isNormalized": false
// };
>>>>>>> a281a65a03509597131d9154cb4eef80cbfffe9f

function setup() {
  const options = {
    inputs: 3,
    outputs: ['yes', 'no'],
    task: 'classification'
  }
  const nn = ml5.neuralNetwork(options);
<<<<<<< HEAD

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
=======
  nn.buildModelBasedOnNothing();

  const results1 = nn.classifySync([0.2, 0.1, 0.5]);
  console.log(results1);

  // Mutating a neural network
  // TODO: nn.mutate();
  nn.neuralNetwork.mutate(1.0);
  const results2 = nn.classifySync([0.2, 0.1, 0.5]);
  console.log(results2);

  // nn.addData([0,0,0],['yes']);
  // nn.addData([0,0,0],['no']);
  // nn.neuralNetworkData.createMetadata(nn.neuralNetworkData.data.raw);
  // nn.addDefaultLayers('classification', nn.neuralNetworkData.meta);

  // nn.classify([0.2], (err, result) => {
  //   if (err) console.log(err);
  //   console.log(result);
  // });
>>>>>>> a281a65a03509597131d9154cb4eef80cbfffe9f
}