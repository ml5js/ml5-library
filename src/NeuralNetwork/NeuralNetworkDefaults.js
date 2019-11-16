const DEFAULTS = {
  task: 'regression',
  activationHidden: 'sigmoid',
  activationOutput: 'sigmoid',
  debug: false,
  learningRate: 0.25,
  inputs: 2,
  outputs: 1,
  noVal: null,
  hiddenUnits: 16,
  modelMetrics: ['accuracy'],
  modelLoss: 'meanSquaredError',
  modelOptimizer: null,
  batchSize: 64,
  epochs: 32,
  returnTensors: false,
}

export default DEFAULTS;