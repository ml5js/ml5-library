// Daniel Shiffman
// Neuro-Evolution Flappy Bird with TensorFlow.js
// http://thecodingtrain.com
// https://youtu.be/cdUNkwXx-I4

class NeuralNetwork {
  constructor(nn) {
    if (nn) this.nn = nn;
    else this.nn = createModel();
  }

  copy() {
    return ml5.tf.tidy(() => {
      const nnCopy = createModel();
      const weights = this.nn.neuralNetwork.model.getWeights();
      const weightCopies = [];
      for (let i = 0; i < weights.length; i++) {
        weightCopies[i] = weights[i].clone();
      }
      nnCopy.neuralNetwork.model.setWeights(weightCopies);
      return new NeuralNetwork(nnCopy);
    });
  }

  mutate(rate) {
    ml5.tf.tidy(() => {
      const weights = this.nn.neuralNetwork.model.getWeights();
      const mutatedWeights = [];
      for (let i = 0; i < weights.length; i++) {
        let tensor = weights[i];
        let shape = weights[i].shape;
        let values = tensor.dataSync().slice();
        for (let j = 0; j < values.length; j++) {
          if (random(1) < rate) {
            let w = values[j];
            values[j] = w + randomGaussian();
          }
        }
        let newTensor = ml5.tf.tensor(values, shape);
        mutatedWeights[i] = newTensor;
      }
      this.nn.neuralNetwork.model.setWeights(mutatedWeights);
    });
  }

  dispose() {
    this.nn.neuralNetwork.model.dispose();
  }
}

function createModel() {
  let meta = {
    "inputUnits": [5],
    "outputUnits": 2,
    "inputs": { 0: { "dtype": "number", "min": 0, "max": 1.0 },
                1: { "dtype": "number", "min": 0, "max": 1.0 }, 
                2: { "dtype": "number", "min": 0, "max": 1.0 },
                3: { "dtype": "number", "min": 0, "max": 1.0 }, 
                4: { "dtype": "number", "min": 0, "max": 1.0 } 
              },
    "outputs": {
      "label": {
        "dtype": "string",
        "min": 0,
        "max": 1,
        "uniqueValues": ["up", "down"],
        "legend": { "up": [1, 0], "down": [0, 1]}
      }
    },
    "isNormalized": false
  };
  const options = {
    inputs: 5,
    outputs: 2,
    task: 'classification'
  }      
  const nn = ml5.neuralNetwork(options);
  nn.addDefaultLayers('classification', meta);
  nn.neuralNetworkData.meta = meta;
  return nn;
}