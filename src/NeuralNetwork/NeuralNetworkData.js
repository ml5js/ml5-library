import * as tf from '@tensorflow/tfjs';
// import * as tfvis from '@tensorflow/tfjs-vis';
// import callCallback from '../utils/callcallback';
import DEFAULTS from './NeuralNetworkDefaults';

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["shuffle", "normalizeArray"] }] */
class NeuralNetworkData {
  constructor(options) {
    this.task = options.task || DEFAULTS.task;

    this.inputs = options.inputs || DEFAULTS.inputs;
    this.outputs = options.outputs || DEFAULTS.outputs;

    this.meta = {
      inputUnits: null,
      outputUnits: null,
      inputTypes: [],
      outputTypes: [],
    }

    this.data = null;
    this.xs = [];
    this.ys = [];
    this.tensor = null;
    this.normalizedData = {
      inputs: null,
      targets: null,
    }

  }

  syncData() {
    this.data = [...new Array(this.xs.length).fill(null).map((item, idx) => ({
      xs: this.xs[idx],
      ys: this.ys[idx]
    }))]
  }

  /**
   * Shuffle this.data
   * If there are xs and ys, mash them in to data
   */
  shuffle() {
    if (this.data === null) {
      this.syncData();
    }
    tf.util.shuffle(this.data);
  }

  /**
   *
   */
  encodeValues(ioTypeArray, ioType) {

    let dval;
    let ioTypes;
    if (ioType === 'input') {
      dval = 'xs';
      ioTypes = this.meta.inputTypes;
    } else {
      dval = 'ys';
      ioTypes = this.meta.outputTypes;
    }

    return ioTypeArray.map((header, idx) => {
      const {
        dtype,
        name
      } = header;

      let encodedValues;

      if (dtype === 'string') {
        const dataArray = this.data.map(d => d[dval][name]);
        const uniqueValues = [...new Set(dataArray)];
        const oneHotValues = dataArray.map((item) => {
          return uniqueValues.indexOf(item)
        })

        // encodedValues = tf.oneHot(tf.tensor1d(oneHotValues, 'int32'), ioUnits);
        const oneHotEncodedValues = tf.oneHot(tf.tensor1d(oneHotValues, 'int32'), uniqueValues.length);
        encodedValues = oneHotEncodedValues.dataSync();

        // TODO: This is super inefficient to .dataSync() and .arraySync()
        // COME BACK TO THIS LATER!
        const oneHotEncodedValuesArray = oneHotEncodedValues.arraySync()
        ioTypes[idx].legend = {}

        uniqueValues.forEach((uVal, uIdx) => {
          ioTypes[idx].legend[uVal] = oneHotEncodedValuesArray[uIdx]
        })


      } else {
        // if numeric - return numbers
        encodedValues = this.data.map(d => d[dval][name]);
      }

      // return values
      return encodedValues
    })

  }

  ensureIOTypes(ioType) {
    let dval;
    if (ioType === 'input') {
      dval = 'xs'
    } else {
      dval = 'ys'
    }


    return Object.keys(this.data[0][dval]).map(prop => {

      const val = this.data[0][dval][prop];

      const output = {
        name: prop,
        dtype: null,
        uniqueValueCount: null
      }
      if (typeof val === 'string') {
        output.dtype = typeof val

        // TODO: create a key/value map of values to one-hot encoded values here???
        const dataArray = this.data.map(d => d[dval][prop]);
        const uniqueValues = [...new Set(dataArray)];
        output.uniqueValueCount = uniqueValues.length;

      } else {
        output.dtype = typeof val
      }

      return output;
    })

  }


  /**
   * normalize array
   * @param {*} arr
   */
  normalizeArray(arr) {
    const inputTensor = tf.tensor1d(arr);

    const inputMax = inputTensor.max();
    const inputMin = inputTensor.min();

    const normalizedInputs = inputTensor
      .sub(inputMin)
      .div(inputMax.sub(inputMin))

    return normalizedInputs.arraySync();
  }

  /**
   * normalize array
   * @param {*} arr
   */
  normalizeIOArray(arr, idx, ioType) {

    let ioTypesArray;
    if (ioType === 'inputs') {
      ioTypesArray = this.meta.inputTypes
    } else {
      ioTypesArray = this.meta.outputTypes
    }
    const ioMetaInfo = ioTypesArray[idx];

    const inputTensor = tf.tensor1d(arr);

    const inputMax = inputTensor.max();
    const inputMin = inputTensor.min();

    // Set the input min and max of the input/output- Types
    ioMetaInfo.max = inputMax.arraySync();
    ioMetaInfo.min = inputMin.arraySync();

    const normalizedInputs = inputTensor
      .sub(inputMin)
      .div(inputMax.sub(inputMin))

    return normalizedInputs.arraySync();
  }



  /**
   * Reshape an array back to it
   * @param {*} arr
   */
  reshapeData(inputArray, ioTypeArray) {

    const output = []

    for (let i = 0; i < this.data.length; i += 1) {

      const row = [];

      for (let idx = 0; idx < inputArray.length; idx += 1) {
        const {
          dtype,
          uniqueValueCount
        } = ioTypeArray[idx];

        if (dtype === 'string') {
          for (let j = 0; j < uniqueValueCount; j += 1) {
            row.push(inputArray[idx][(i * uniqueValueCount) + j])
          }

        } else if (dtype === 'number') {

          row.push(inputArray[idx][i]);

        } else {
          console.log('data type not supported');
        }

      }

      output.push(row);

    }

    return output;

  }

  /**
   * Normalize this.data
   * Requires the inputTypes and outputTypes to be defined
   */
  normalize() {
    // if (this.data === null) {
    this.syncData();

    // TODO: check data and set inputTypes and outputTypes
    this.meta.inputTypes = this.ensureIOTypes('input')
    this.meta.outputTypes = this.ensureIOTypes('output')


    // get the labels
    const {
      inputTypes,
      outputTypes
    } = this.meta;

    // Check which data are string types
    const inputs = this.encodeValues(inputTypes, 'input')
    const targets = this.encodeValues(outputTypes, 'output')

    // Normalized the inputs - TODO: this can be optimized!
    const normalizedInputs = inputs.map((item, idx) => this.normalizeIOArray(item, idx, 'inputs'));
    const normalizedOutputs = targets.map((item, idx) => this.normalizeIOArray(item, idx, 'outputs'));

    const reshapedInputs = this.reshapeData(normalizedInputs, inputTypes);
    const reshapedOutputs = this.reshapeData(normalizedOutputs, outputTypes);

    // convert those data to tensors after encoding oneHot() or not
    const inputTensor = tf.tensor(reshapedInputs).flatten().reshape([this.data.length, this.meta.inputUnits])
    const outputTensor = tf.tensor(reshapedOutputs).flatten().reshape([this.data.length, this.meta.outputUnits])

    // console.log('----------- input tensor')
    // inputTensor.print()

    // console.log('----------- output tensor')
    // outputTensor.print()

    this.normalizedData = {
      tensors: {
        inputs: inputTensor, // normalizedInputs,
        targets: outputTensor,
      }
    }
  }

  /**
   * Gets the total number of inputs/outputs based on the data type
   * Uses the relevant function to convert values e.g. oneHot() and
   * sends back the appropriate length of values
   * @param {*} val
   */
  getIOUnits() {
    let inputUnits = 0;
    let outputUnits = 0;

    this.meta.inputTypes.forEach((item) => {
      if (item.dtype === 'number') {
        inputUnits += 1;
      } else if (item.dtype === 'string') {
        const uniqueVals = [...new Set(this.xs.map(obj => obj[item.name]))]
        inputUnits += uniqueVals.length;
      }
    });

    this.meta.outputTypes.forEach((item) => {

      if (item.dtype === 'number') {
        outputUnits += 1;
      } else if (item.dtype === 'string') {
        const uniqueVals = [...new Set(this.ys.map(obj => obj[item.name]))]
        outputUnits += uniqueVals.length;
      } else {
        console.log('not supported')
      }

    });

    this.meta.inputUnits = inputUnits;
    this.meta.outputUnits = outputUnits;

  }

  /**
   * Adds data to the xs and ys array
   * These data get "mashed" into the data object
   * when .normalize() or .shuffle() are called
   * TODO: Figure out a way to sync all this!
   * @param {*} xs
   * @param {*} ys
   */
  addData(xs, ys) {
    this.xs.push(xs);
    this.ys.push(ys);
  }

}


export default NeuralNetworkData;