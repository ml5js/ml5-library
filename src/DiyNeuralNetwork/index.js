import * as tf from '@tensorflow/tfjs';
import NeuralNetwork from './NeuralNetwork';
import NeuralNetworkData from './NeuralNetworkData';

class DiyNeuralNetwork{
  
  constructor(options, cb){
    this.callback = cb;
    this.options = options || {};

    this.neuralNetwork = new NeuralNetwork();
    this.neuralNetworkData = new NeuralNetworkData();
    
  }

  /**
   * 
   * @param {*} _options 
   */
  compile(_options){
    const DEFAULT_LEARNING_RATE = 0.2;
    const options = Object.assign({}, {
      loss: 'categoricalCrossentropy',
      optimizer: tf.train.sgd(DEFAULT_LEARNING_RATE), 
      metrics: ['accuracy'],
      ..._options
    })

    this.neuralNetwork.compile(options);
  }


  /**
   * createDenseLayer
   * @param {*} _options 
   */
  // eslint-disable-next-line class-methods-use-this
  createDenseLayer(_options){

    const options = Object.assign({}, {
      units: 16,
      activation: 'relu',
      ..._options
    });
    
    return tf.layers.dense(options);
  }

  /**
   * createConv2dLayer
   * @param {*} _options 
   */
  // eslint-disable-next-line class-methods-use-this
  createConv2dLayer(_options){
    const options = Object.assign({},{
      kernelSize: 5,
      filters: 8,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling',
      ..._options
    })

    return tf.layers.conv2d(options);
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
  return instance;
}

export default neuralNetwork