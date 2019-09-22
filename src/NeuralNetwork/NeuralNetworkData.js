import * as tf from '@tensorflow/tfjs';
// import * as tfvis from '@tensorflow/tfjs-vis';
// import callCallback from '../utils/callcallback';
import DEFAULTS from './NeuralNetworkDefaults';

class NeuralNetworkData {
  constructor(options) {
    this.task = options.task || DEFAULTS.task;

    this.inputs = options.inputs || DEFAULTS.inputs;
    this.outputs = options.outputs || DEFAULTS.outputs;
    // this.noVal = options.noVal || DEFAULTS.noVal;

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
      inputMax: null,
      inputMin: null,
      targetMax: null,
      targetMin: null,
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
  /* eslint class-methods-use-this: ["error", { "exceptMethods": ["shuffle"] }] */
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
    let ioUnits;
    if (ioType === 'input') {
      dval = 'xs';
      ioUnits = this.meta.inputUnits;
    } else {
      dval = 'ys';
      ioUnits = this.meta.outputUnits;
    }

    return ioTypeArray.map(header => {
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

        encodedValues = tf.oneHot(tf.tensor1d(oneHotValues, 'int32'), ioUnits);
        encodedValues = encodedValues.dataSync();
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

    console.log(this.data[0][dval])

    return Object.keys(this.data[0][dval]).map(prop => {
      const val = this.data[0][dval][prop];
      const output = {
        name: prop,
        dtype: null
      }
      if (typeof val === 'string') {
        output.dtype = 'string'
      } else {
        output.dtype = 'number'
      }

      return output;
    })

  }

  /**
   * Normalize this.data
   * Requires the inputTypes and outputTypes to be defined
   */
  normalize() {
    if (this.data === null) {
      this.syncData();

      // TODO: check data and set inputTypes and outputTypes
      this.meta.inputTypes = this.ensureIOTypes('input')
      this.meta.outputTypes = this.ensureIOTypes('output')

    }

    // get the labels
    const {
      inputTypes,
      outputTypes
    } = this.meta;

    // TODO: STEP X - Check which data are string types
    const inputs = this.encodeValues(inputTypes, 'input')
    const targets = this.encodeValues(outputTypes, 'output');

    // convert those data to tensors after encoding oneHot() or not
    const inputTensor = tf.tensor(inputs);
    const outputTensor = tf.tensor(targets).cast('float32');

    // // Step 3. Normalize the data to the range 0 - 1 using min-max scaling
    // TODO: need to ensure to preserve the axis correctly! - Subject to change!
    const inputMax = inputTensor.max(1, true);
    const inputMin = inputTensor.min(1, true);
    const targetMax = outputTensor.max(1, true);
    const targetMin = outputTensor.min(1, true);

    inputMax.print()
    inputMin.print()
    targetMax.print()
    targetMin.print()

    const normalizedInputs = inputTensor
      .sub(inputMin)
      .div(inputMax.sub(inputMin))
      .flatten()
      .reshape([this.data.length, this.meta.inputUnits]);
    const normalizedOutputs = outputTensor
      .sub(targetMin)
      .div(targetMax.sub(targetMin))
      .flatten().reshape([this.data.length, this.meta.outputUnits]);

    this.normalizedData = {
      // Return the min/max bounds so we can use them later.
      tensors: {
        inputs: normalizedInputs, // normalizedInputs,
        targets: normalizedOutputs,
        inputMax,
        inputMin,
        targetMax,
        targetMin,
      },
      inputMax: inputMax.arraySync(),
      inputMin: inputMin.arraySync(),
      targetMax: targetMax.arraySync(),
      targetMin: targetMin.arraySync()
    }
    // });
  }

  /**
   * Normalize one value or array
   * TODO: not sure this is the best way!
   * @param {*} arr
   */
  normalizeSingle(val, io) {

    let min;
    let max;
    let arr;

    // check if single value or array
    if (val instanceof Array) {
      arr = val;
    } else {
      arr = [val];
    }

    if (io === "input") {
      min = this.normalizedData.tensors.inputMin;
      max = this.normalizedData.tensors.inputMax;
    } else if (io === "output") {
      min = this.normalizedData.tensors.targetMin;
      max = this.normalizedData.tensors.targetMax;
    }

    const inputTensor = tf.tensor1d(arr);
    const normTensor = inputTensor
      .sub(min)
      .div(max.sub(min));

    return normTensor.dataSync()
  }

  /**
   * unnormalizeSingle()
   * Get back a number or array being normalized
   * based on the input data
   * @param {*} val
   * @param {*} io
   */
  unnormalizeSingle(val, io) {
    let min;
    let max;
    let arr;

    // check if single value or array
    if (val instanceof Array) {
      arr = val;
    } else {
      arr = [val];
    }

    if (io === "input") {
      min = this.normalizedData.tensors.inputMin;
      max = this.normalizedData.tensors.inputMax;
    } else if (io === "output") {
      min = this.normalizedData.tensors.targetMin;
      max = this.normalizedData.tensors.targetMax;
    }

    const inputTensor = tf.tensor1d(arr);
    const unNormPreds = inputTensor
      .mul(max.sub(min))
      .add(min);

    return unNormPreds.dataSync();
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
      }
    });

    console.log(inputUnits, outputUnits)

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