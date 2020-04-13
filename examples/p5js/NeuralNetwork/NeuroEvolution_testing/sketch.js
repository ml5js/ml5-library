function setup() {
  const options = {
    inputs: 3,
    outputs: ['yes', 'no'],
    task: 'classification',
    noTraining: true
  }
  const nnA = ml5.neuralNetwork(options);
  const results1 = nnA.classifySync([0.2, 0.1, 0.5]);
  console.log('----- Classification A ------');
  console.log(results1[0]);
 
  nnA.mutate(0.1);
  const results2 = nnA.classifySync([0.2, 0.1, 0.5]);
  console.log('----- Default Mutated Classification A ------');
  console.log(results2[0]);

  // Mutating a neural network
  function customMutate(val) {
    return val + random(-5, 5);
  }
  nnA.mutate(0.1, customMutate);
  const results3 = nnA.classifySync([0.2, 0.1, 0.5]);
  console.log('----- Custom Mutated Classification A ------');
  console.log(results3[0]);

  const nnCopy = nnA.copy();
  const results4 = nnCopy.classifySync([0.2, 0.1, 0.5]);
  console.log('----- Identical Copy Classification A ------');
  console.log(results4[0]);

  const nnB = ml5.neuralNetwork(options);
  const results5 = nnB.classifySync([0.2, 0.1, 0.5]);
  console.log('----- Classification B ------');
  console.log(results5[0]);

  const child = nnA.crossover(nnB);
  const resultsA = nnA.classifySync([0.2, 0.1, 0.5]);
  const resultsB = nnB.classifySync([0.2, 0.1, 0.5]);
  const childResults = child.classifySync([0.2, 0.1, 0.5]);
  console.log('----- Classification A ------');
  console.log(resultsA[0]);
  console.log('----- Classification B ------');
  console.log(resultsB[0]);
  console.log('----- Crossover AB classification ------');
  console.log(childResults[0]);
}