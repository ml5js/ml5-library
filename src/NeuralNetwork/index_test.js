// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


const {
    neuralNetwork
} = ml5;

const NN_DEFAULTS = {
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
}


describe('neuralNetwork', () => {
    let nn;

    beforeAll(async () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
        nn = await neuralNetwork();
    });

    it('Should create neuralNetwork with all the defaults', async () => {
        expect(nn.config.debug).toBe(NN_DEFAULTS.debug);
        // architecture defaults
        expect(nn.config.architecture.task).toBe(NN_DEFAULTS.task);

        // expect(nn.config.architecture.layers).toBe();
        // expect(nn.config.architecture.activations).toBe(NN_DEFAULTS.activations);

        // training defaults
        expect(nn.config.training.batchSize).toBe(NN_DEFAULTS.batchSize);
        expect(nn.config.training.epochs).toBe(NN_DEFAULTS.epochs);
        expect(nn.config.training.learningRate).toBe(NN_DEFAULTS.learningRate);

        // expect(nn.config.training.modelMetrics).toBe(NN_DEFAULTS.modelMetrics);
        expect(nn.config.training.modelLoss).toBe(NN_DEFAULTS.modelLoss);
        // expect(nn.config.training.modelOptimizer).toBe();

        // data defaults
        // expect(nn.config.dataOptions.dataUrl).toBe();
        // expect(nn.config.dataOptions.inputs).toBe(NN_DEFAULTS.inputs);
        // expect(nn.config.dataOptions.outputs).toBe(NN_DEFAULTS.outputs);

        // expect(nn.config.dataOptions.normalizationOptions).toBe();

    });

});