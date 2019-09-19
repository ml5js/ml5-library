const DEFAULTS = {
    task: 'regression',
    activationHidden: 'sigmoid',
    activationOutput: 'sigmoid',
    debug: true,
    learningRate: 0.25,
    inputs: 2,
    outputs: 1,
    noVal: null,
    hiddenUnits: 1,
    modelMetrics: [ 'accuracy'],
    modelLoss: 'meanSquaredError',
    modelOptimizer: null,
    batchSize: 64,
    epochs: 32,
  }

export default DEFAULTS;