import * as tf from '@tensorflow/tfjs';
import NeuralNetwork from './NeuralNetwork';

class DiyNeuralNetwork extends NeuralNetwork {
  
  constructor(options, cb){
    super(options);
    this.callback = cb;
 
  }





  /**
   * 
   */
  defineDefaultModelLayers(){
    if(!this.config.architecture.layers.length > 0){
      this.config.architecture.layers = [];

      const {
        hiddenUnits
      } = this.config.architecture;

      const hidden = tf.layers.dense({
        units: hiddenUnits,
        inputShape: [this.config.architecture.inputUnits],
        activation: 'relu',
      });

      const output = tf.layers.dense({
        units: this.config.architecture.outputUnits,
        activation: 'sigmoid',
      });

      this.config.architecture.layers = [hidden, output];
    }
  }


  /**
   * 
   */
  createModelInternal() {

    // add the layers to the model as defined in config.architecture.layers
    this.config.architecture.layers.forEach(layer => {
      this.addLayer(layer);
    });

    // compile the model
    const {
      modelOptimizer,
      modelLoss,
      modelMetrics
    } = this.config.modelOptions;

    this.compile({
      optimizer: modelOptimizer,
      loss: modelLoss,
      metrics: modelMetrics,
    });

  }

  /**
   * 
   */
  createModel(){
    this.defineDefaultModelLayers();
    this.createModelInternal();
  }

}


const neuralNetwork = (inputsOrOptions, outputsOrCallback, callback) => {
  let options;
  let cb;

  if (inputsOrOptions instanceof Object) {
    options = inputsOrOptions;
    cb = outputsOrCallback;
  } else {
    options = {
      inputs: inputsOrOptions,
      outputs: outputsOrCallback,
    };
    cb = callback;
  }

  const instance = new DiyNeuralNetwork(options, cb);
  console.log(instance);
  return instance;
}

export default neuralNetwork