// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as tf from '@tensorflow/tfjs';
import neuralNetwork from './index';

describe('NeuralNetwork', () => {
  // The entire neural network as a whole
  describe('DiyNeuralNetwork Class', () => {
    // init
    xdescribe('init', () => {
      it('should init', () => {
        // TODO:
        // ...
      });
    });

    // addData
    xdescribe('addData', () => {
      it('should addData', () => {
        // TODO:
        // ...
      });
    });

    // loadDataFromUrl
    xdescribe('loadDataFromUrl', () => {
      it('should loadDataFromUrl', () => {
        // TODO:
        // ...
      });
    });

    // loadDataInternal
    xdescribe('loadDataInternal', () => {
      it('should loadDataInternal', () => {
        // TODO:
        // ...
      });
    });

    // createMetaData
    xdescribe('createMetaData', () => {
      it('should createMetaData', () => {
        // TODO:
        // ...
      });
    });

    // prepareForTraining
    xdescribe('prepareForTraining', () => {
      it('should prepareForTraining', () => {
        // TODO:
        // ...
      });
    });

    // normalizeData
    xdescribe('normalizeData', () => {
      it('should normalizeData', () => {
        // TODO:
        // ...
      });
    });

    // normalizeInput
    xdescribe('normalizeInput', () => {
      it('should normalizeInput', () => {
        // TODO:
        // ...
      });
    });

    // searchAndFormat
    xdescribe('searchAndFormat', () => {
      it('should searchAndFormat', () => {
        // TODO:
        // ...
      });
    });

    // formatInputItem
    xdescribe('formatInputItem', () => {
      it('should formatInputItem', () => {
        // TODO:
        // ...
      });
    });

    // convertTrainingDataToTensors
    xdescribe('convertTrainingDataToTensors', () => {
      it('should convertTrainingDataToTensors', () => {
        // TODO:
        // ...
      });
    });

    // formatInputsForPrediction
    xdescribe('formatInputsForPrediction', () => {
      it('should formatInputsForPrediction', () => {
        // TODO:
        // ...
      });
    });

    // formatInputsForPredictionAll
    xdescribe('formatInputsForPredictionAll', () => {
      it('should formatInputsForPredictionAll', () => {
        // TODO:
        // ...
      });
    });

    // isOneHotEncodedOrNormalized
    xdescribe('isOneHotEncodedOrNormalized', () => {
      it('should isOneHotEncodedOrNormalized', () => {
        // TODO:
        // ...
      });
    });

    // train
    xdescribe('train', () => {
      it('should train', () => {
        // TODO:
        // ...
      });
    });

    // trainInternal
    xdescribe('trainInternal', () => {
      it('should trainInternal', () => {
        // TODO:
        // ...
      });
    });

    // addLayer
    xdescribe('addLayer', () => {
      it('should addLayer', () => {
        // TODO:
        // ...
      });
    });

    // createNetworkLayers
    xdescribe('createNetworkLayers', () => {
      it('should createNetworkLayers', () => {
        // TODO:
        // ...
      });
    });

    // addDefaultLayers
    xdescribe('addDefaultLayers', () => {
      it('should addDefaultLayers', () => {
        // TODO:
        // ...
      });
    });

    // compile
    xdescribe('compile', () => {
      it('should compile', () => {
        // TODO:
        // ...
      });
    });

    // predict
    xdescribe('predict', () => {
      it('should predict', () => {
        // TODO:
        // ...
      });
    });

    // predictMultiple
    xdescribe('predictMultiple', () => {
      it('should predictMultiple', () => {
        // TODO:
        // ...
      });
    });

    // classify
    xdescribe('classify', () => {
      it('should classify', () => {
        // TODO:
        // ...
      });
    });

    // classifyMultiple
    xdescribe('classifyMultiple', () => {
      it('should classifyMultiple', () => {
        // TODO:
        // ...
      });
    });

    // predictInternal
    xdescribe('predictInternal', () => {
      it('should predictInternal', () => {
        // TODO:
        // ...
      });
    });

    // classifyInternal
    xdescribe('classifyInternal', () => {
      it('should classifyInternal', () => {
        // TODO:
        // ...
      });
    });

    // saveData
    xdescribe('saveData', () => {
      it('should saveData', () => {
        // TODO:
        // ...
      });
    });

    // loadData
    xdescribe('loadData', () => {
      it('should loadData', () => {
        // TODO:
        // ...
      });
    });

    // save
    xdescribe('save', () => {
      it('should save', () => {
        // TODO:
        // ...
      });
    });

    // load
    xdescribe('load', () => {
      it('should load', () => {
        // TODO:
        // ...
      });
    });
  });

  /**
   * Describes the neural network class
   */
  describe('NeuralNetwork Class', () => {
    jest.setTimeout(100000);
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
          tf.layers.dense({
            units: 2,
            inputShape: [2],
            activation: 'relu',
          }),
        );
        brain.addLayer(
          tf.layers.dense({
            units: 2,
            activation: 'relu',
          }),
        );
        expect(brain.model.layers.length).toBe(2);
      });
    });

    /**
     * compile
     */
    describe('.compile()', () => {
      it('should compile', () => {
        const modelCompileOptions = {
          loss: 'categoricalCrossentropy',
          optimizer: tf.train.sgd(0.2),
          metrics: ['accuracy'],
        };
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
          inputs: tf.tensor(
            [
              [0, 0],
              [1, 1],
            ],
            [2, 2],
          ),
          outputs: tf.tensor(
            [
              [0, 1],
              [1, 0],
            ],
            [2, 2],
          ),
          batchSize: 1,
          epochs: 2,
          shuffle: true,
          validationSplit: 0.2,
          whileTraining: () => {
            return null;
          },
        };

        await brain.trainInternal(trainingOptions);

        expect(brain.isTrained).toBe(true);
      });
    });

    /**
     * classify
     */
    describe('.classify() & .predict()', () => {
      it('should return an array', async () => {
        let input;

        input = tf.tensor([[0, 0]], [1, 2]);
        const prediction1 = await brain.classify(input);

        input = tf.tensor([[0, 0]], [1, 2]);
        const prediction2 = await brain.predict(input);

        input.dispose();
        expect(prediction1 instanceof Array).toBe(true);
        expect(prediction2 instanceof Array).toBe(true);
      });
    });
  });

  /**
   * NeuralNetworkData
   */
  // the NeuralNetworkData class
  describe('NeuralNetworkData Class', () => {
    jest.setTimeout(100000);
    const nn = neuralNetwork();
    const brainData = nn.neuralNetworkData;

    xdescribe('createMetadata()', () => {
      it('should createMetadata()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('getDataStats()', () => {
      it('should getDataStats()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('getInputMetaStats()', () => {
      it('should getInputMetaStats()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('getDataUnits()', () => {
      it('should getDataUnits()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('getInputMetaUnits()', () => {
      it('should getInputMetaUnits()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('getDTypesFromData()', () => {
      it('should getDTypesFromData()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('addData()', () => {
      it('should addData()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('convertRawToTensors()', () => {
      it('should convertRawToTensors()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('normalizeDataRaw()', () => {
      it('should normalizeDataRaw()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('normalizeInputData()', () => {
      it('should normalizeInputData()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('normalizeArray()', () => {
      it('should normalizeArray()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('unnormalizeArray()', () => {
      it('should unnormalizeArray()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('applyOneHotEncodingsToDataRaw()', () => {
      it('should applyOneHotEncodingsToDataRaw()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('getDataOneHot()', () => {
      it('should getDataOneHot()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('getInputMetaOneHot()', () => {
      it('should getInputMetaOneHot()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('createOneHotEncodings()', () => {
      it('should createOneHotEncodings()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('loadDataFromUrl()', () => {
      it('should loadDataFromUrl()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('loadJSON()', () => {
      it('should loadJSON()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('loadCSV()', () => {
      it('should loadCSV()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('loadBlob()', () => {
      it('should loadBlob()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('loadData()', () => {
      it('should loadData()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('saveData()', () => {
      it('should saveData()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('saveMeta()', () => {
      it('should saveMeta()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('loadMeta()', () => {
      it('should loadMeta()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('findEntries()', () => {
      it('should findEntries()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('formatRawData()', () => {
      it('should formatRawData()', () => {
        // TODO
        // ...
      });
    });

    xdescribe('csvToJSON()', () => {
      it('should csvToJSON()', () => {
        // TODO
        // ...
      });
    });
  });
});

// /**
//    * NeuralNetworkData
//    */
//   // the NeuralNetworkUtils class
//   describe('NeuralNetworkUtils Class', () => {
//     // normalizeValue()
//     describe('.normalizeValue()', () => {
//       it('should normalize a single number to 0 - 1', () => {});
//     });

//     // unnormalizeValue()
//     describe('.unnormalizeValue()', () => {
//       it('should unnormalize a value from 0 - 1 to the given range', () => {
//         // TODO:
//       });
//     });

//     // getMin()
//     describe('.getMin()', () => {
//       it('should get the min value from an array', () => {
//         // TODO:
//       });
//     });

//     // getMax()
//     describe('.getMax()', () => {
//       it('should get the max value from an array ', () => {
//         // TODO:
//       });
//     });

//     // isJsonOrString()
//     describe('.isJsonOrString()', () => {
//       it('should tests if a string is a valid json or string', () => {
//         // TODO:
//       });
//     });

//     // zipArrays()
//     describe('.zipArrays()', () => {
//       it('should take two arrays and zip them into one array', () => {
//         // TODO:
//       });
//     });

//     // createLabelsFromArrayValues()
//     describe('.createLabelsFromArrayValues()', () => {
//       it('should createLabelsFromArrayValues()', () => {
//         // TODO:
//       });
//     });

//     // formatDataAsObject()
//     describe('.formatDataAsObject()', () => {
//       it('should formatDataAsObject()', () => {
//         // TODO:
//       });
//     });

//     // getDataType()
//     describe('.getDataType()', () => {
//       it('should getDataType()', () => {
//         // TODO:
//       });
//     });
//   });
