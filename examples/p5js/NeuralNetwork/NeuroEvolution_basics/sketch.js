function setup() {
  // Options for Neural Network
  const options = {
    inputs: 1,
    outputs: 2,
    task: 'classification'
  }
  // Create Neural Network
  const nn = ml5.neuralNetwork(options);
  nn.addData([0.1], ['left'])
  nn.addData([0.9], ['right'])
  nn.createMetaData(nn.neuralNetworkData.data.raw)
  nn.addDefaultLayers(nn.options.task, nn.neuralNetworkData.meta);
  nn.classify([0.2], (err, result) => {
    console.log('hello');
    if (err) console.log(err);
    console.log(result);
  });
}