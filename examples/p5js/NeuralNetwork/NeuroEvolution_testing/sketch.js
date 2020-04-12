function setup() {
  const options = {
    inputs: 3,
    outputs: ['yes', 'no'],
    task: 'classification',
    noTraining: true
  }
  const nn = ml5.neuralNetwork(options);

  const results1 = nn.classifySync([0.2, 0.1, 0.5]);
  console.log(results1);

  // Mutating a neural network
  // TODO: nn.mutate();
  nn.mutate(1.0);
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
}