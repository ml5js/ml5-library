function setup() {
  const options = {
    inputs: 3,
    outputs: ['yes', 'no'],
    task: 'classification',
    noTraining: true
  }
  const nnA = ml5.neuralNetwork(options);
  const results1 = nnA.classifySync([0.2, 0.1, 0.5]);
  console.log(results1[0]);

  // Mutating a neural network
  nnA.mutate(0.1);
  const results2 = nnA.classifySync([0.2, 0.1, 0.5]);
  console.log(results2[0]);

  const nnCopy = nnA.copy();
  const results3 = nnCopy.classifySync([0.2, 0.1, 0.5]);
  console.log(results3[0]);

  const nnB = ml5.neuralNetwork(options);
  const results4 = nnB.classifySync([0.2, 0.1, 0.5]);
  console.log(results4[0]);

  const child = nnA.crossover(nnB);
  const resultsA = nnA.classifySync([0.2, 0.1, 0.5]);
  const resultsB = nnB.classifySync([0.2, 0.1, 0.5]);
  const childResults = child.classifySync([0.2, 0.1, 0.5]);
  console.log(resultsA[0]);
  console.log(resultsB[0]);
  console.log(childResults[0]);
}