import * as tf from '@tensorflow/tfjs';
import NeuralNetwork from './NeuralNetwork';
import NeuralNetworkData from './NeuralNetworkData';

class DiyNeuralNetwork{
  
  constructor(options, cb){
    this.callback = cb;
    this.options = options || {};

    this.neuralNetwork = new NeuralNetwork();
    this.neuralNetworkData = new NeuralNetworkData();

    this.data = {
      training: []
    }
    
  }

  /**
   * createMetaDataFromData
   * create your meta data about your data
   * @param {*} _dataRaw 
   */
  createMetaDataFromData(_dataRaw = null){
    const dataRaw = _dataRaw === null ? this.neuralNetworkData.data.raw : _dataRaw;
    
    const meta = this.neuralNetworkData.createMetaDataFromData(dataRaw)
    this.neuralNetworkData.meta = meta;
    return meta;
  }

  

  /**
   * summarizeData
   * adds min and max to the meta of each input and output property
   */
  summarizeData(_dataRaw = null, _meta = null){
    const dataRaw = _dataRaw === null ? this.neuralNetworkData.data.raw : _dataRaw;
    const meta = _meta === null ? this.neuralNetworkData.meta : _meta;
    
    const inputMeta = this.neuralNetworkData.getRawStats(dataRaw, meta.inputs, 'xs');
    const outputMeta = this.neuralNetworkData.getRawStats(dataRaw, meta.outputs, 'ys');

    this.neuralNetworkData.meta.inputs = inputMeta;
    this.neuralNetworkData.meta.outputs = outputMeta;

    return this.neuralNetworkData.meta;
  }

  /**
   * warmUp
   * @param {*} _dataRaw 
   * @param {*} _meta 
   */
  warmUp(_dataRaw = null, _meta = null){
    const dataRaw = _dataRaw === null ? this.neuralNetworkData.data.raw : _dataRaw;
    const meta = _meta === null ? this.neuralNetworkData.meta : _meta;

    // summarize data
    const updatedMeta = this.summarizeData(dataRaw, meta);
    // apply one hot encodings
    const encodedData = this.neuralNetworkData.applyOneHotEncodingsToDataRaw(dataRaw, meta);


    // set this equal to the training data
    this.data.training = encodedData;

    return {meta:updatedMeta, data:{raw:encodedData} }
  }


  /**
   * convertTrainingDataToTensors
   * @param {*} _trainingData 
   * @param {*} _meta 
   */
  convertTrainingDataToTensors(_trainingData = null, _meta = null){
    const trainingData = _trainingData === null ? this.data.training : _trainingData;
    const meta = _meta === null ? this.neuralNetworkData.meta : _meta;

    return this.neuralNetworkData.convertRawToTensors(trainingData, meta);
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

    // set this equal to the training data
    this.data.training = trainingData;

    return trainingData;
  }


  /**
   * train
   * @param {*} _options 
   * @param {*} _cb 
   */
  train(_options, _cb){
    
    const options = {..._options};

    if(!options.inputs && !options.outputs){
      const {inputs, outputs} = this.convertTrainingDataToTensors(); 
      options.inputs = inputs;
      options.outputs = outputs;
    }
    
    this.neuralNetwork.train(options, _cb);
  }


  /**
   * 
   * @param {*} _options 
   */
  compile(_options){
    this.neuralNetwork.compile(_options);
  }

  
  predict(_input, _cb){

    let inputData = [];
    if (_input instanceof Array) {
      inputData = _input;
    } else if (_input instanceof Object) {
      // TODO: make sure that the input order is preserved!
      const headers = Object.keys(this.neuralNetworkData.meta.inputs);
      inputData = headers.map(prop => {
        return _input[prop]
      });
    }

    inputData = tf.tensor([inputData])
    this.neuralNetwork.predict(inputData, this.neuralNetwork.meta, _cb)
  }

  classify(_input, _cb){
    let inputData = [];
    if (_input instanceof Array) {
      inputData = _input;
    } else if (_input instanceof Object) {
      // TODO: make sure that the input order is preserved!
      const headers = Object.keys(this.neuralNetworkData.meta.inputs);
      inputData = headers.map(prop => {
        return _input[prop]
      });
    }

    inputData = tf.tensor([inputData])
    this.neuralNetwork.classify(inputData, this.neuralNetworkData.meta, _cb);
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