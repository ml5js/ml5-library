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
   * summarizeData
   * adds min and max to the meta of each input and output property
   */
  summarizeData(){
    const {data, meta} = this.neuralNetworkData;
    meta.inputs = this.neuralNetworkData.getRawStats(data.raw, meta.inputs, 'xs');
    meta.outputs = this.neuralNetworkData.getRawStats(data.raw, meta.outputs, 'ys');
  }

  /**
   * normalizeData
   * @param {*} _dataRaw 
   * @param {*} _meta 
   */
  normalizeData(_dataRaw = null, _meta = null){
    const dataRaw = _dataRaw === null ? this.neuralNetworkData.data.raw : _dataRaw;
    const meta = _meta === null ? this.neuralNetworkData.meta : _meta;
    const normalizedInputs  = this.neuralNetworkData.normalizeRaws(dataRaw, meta.inputs, 'xs');
    const normalizedOutputs  = this.neuralNetworkData.normalizeRaws(dataRaw, meta.outputs, 'ys');
    const trainingData = this.neuralNetworkData.zipArrays(normalizedInputs, normalizedOutputs)

    return trainingData
  }


  /**
   * train
   * @param {*} _options 
   * @param {*} _cb 
   */
  train(_options, _cb){
    this.neuralNetwork.train(_options, _cb);
  }


  /**
   * 
   * @param {*} _options 
   */
  compile(_options){
    this.neuralNetwork.compile(_options);
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