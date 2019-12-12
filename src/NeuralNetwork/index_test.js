// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const { neuralNetwork } = ml5;

describe('NeuralNetwork', () => {
  // The entire neural network as a whole
  describe('DiyNeuralNetwork Class', () => {});

  /**
   * Describes the neural network class
   */
  describe('NeuralNetwork Class', () => {
    
    const nn = neuralNetwork();
    const brain = nn.neuralNetwork;
    
    /**
     * initialization
     */
    describe('constructor', () => {
      
      it('instantiates with the all flags as false', () => {
        expect(brain.isTrained).toBe(false);
        expect(brain.isCompiled).toBe(false);
        expect(brain.isLayered).toBe(false);
      });

      it('instantiates with a sequential model', async () => {
        expect(brain.model.name).toBe('sequential_1');
      });
    });


    /**
     * NeuralNetwork addLayer
     */
    describe('.addLayer()', () => {
      
      it('adds 2 layers', () => {
        brain.addLayer(
          ml5.tf.layers.dense({
            units: 2,
            inputShape:[2],
            activation: 'relu',
          }),
        );
        brain.addLayer(
          ml5.tf.layers.dense({
            units: 2,
            activation: 'relu',
          }),
        );
        expect(brain.model.layers.length).toBe(2);
      })
    });

    /**
     * compile
     */
    describe('.compile()', () => {
      
      it('should compile', () => {

        const modelCompileOptions = {
          loss: 'categoricalCrossentropy',
          optimizer: ml5.tf.train.sgd(0.2),
          metrics: ['accuracy'],
        }
        brain.compile(modelCompileOptions);
      
        expect(brain.model.built).toBe(true);
      });

    });

    /**
     * train
     */
    describe('.train()', () => {
      

      it('should train', async () => {
        const trainingOptions = {
          inputs: ml5.tf.tensor([ [0,0], [1,1] ], [2,2]),
          outputs: ml5.tf.tensor([ [0,1], [1,0] ], [2,2]),
          batchSize:1,
          epochs: 2,
          shuffle:true,
          validationSplit:0.2
        }
        
        await brain.trainInternal(trainingOptions)

        expect(brain.isTrained).toBe(true);
      });


    });

  });

  /**
   * NeuralNetworkData
   */
  // the NeuralNetworkData class
  describe('NeuralNetworkData Class', () => {});

  /**
   * NeuralNetworkData
   */
  // the NeuralNetworkUtils class
  describe('NeuralNetworkUtils Class', () => {});

});
