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
   * Normalize this.data
   * return 
   */
  normalize() {
    if (this.data === null) {
      this.syncData();
    }

    // get the labels
    const {inputTypes, outputTypes} = this.meta;
    
    // Step 1. get the inputs and targets
    // const inputs = inputLabels.map(header => this.data.map(d =>  d.xs[header]));
    const inputs = inputTypes.map(header => this.data.map(d => { 
        const {dtype, name} = header;
        let encodedValues;

        // check if the label is a string or numeric type
        // if string - do one hot encoding
        if(dtype === 'string'){
          encodedValues = d.xs[name];
        } else {
          // if numeric - return numbers
          encodedValues = d.xs[name];
        }
        
        // return values
        return encodedValues
      })
    )

    // const targets = outputLabels.map(header => this.data.map(d => d.ys[header]))
    const targets = outputTypes.map(header => this.data.map(d => { 
        
        // check if the label is a string or numeric type

        // if string - do one hot encoding

        // if numeric - return numbers


        // return values
        return d.ys[header] 
      })
    )

    // Step 2. Convert data to Tensor
    let inputTensor;
    let outputTensor;

    // TODO: STEP X - Check which data are string types
    // Then onehot encode them, and mash them up with 
    // the numeric types. 

    // Step X.1: Check inputs for strings
    // this.meta.inputTypes
    // const uniqueInputs = [...new Set(inputs)]
    // const oneHotInputs = inputs.map(input => uniqueInputs.indexOf(input));

    // Step X.2: check outputs for strings
    // this.meta.outputTypes

    if (this.task === 'classification') {
      const uniqueTargets = targets.map( (item) => [...new Set(item)])
      const oneHotTargets = targets.map( (item, idx) => {
        return targets[idx].map( val =>  {
          return uniqueTargets[idx].indexOf(val)
        })
      }) 
      
      const outputTensor1 = tf.tensor(oneHotTargets).asType('int32').flatten() // .reshape() 
      outputTensor = tf.oneHot(outputTensor1, this.meta.outputUnits );
      inputTensor = tf.tensor(inputs);
    } else {
      inputTensor = tf.tensor(inputs);
      outputTensor = tf.tensor(targets);
    }

    // // Step 3. Normalize the data to the range 0 - 1 using min-max scaling
    // TODO: need to ensure to preserve the axis correctly! 
    // Subject to change!
    const inputMax = inputTensor.max(1,true);
    const inputMin = inputTensor.min(1,true);
    const targetMax = outputTensor.max();
    const targetMin = outputTensor.min();

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
      tensors:{
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
    if(val instanceof Array){
      arr = val;
    } else {
      arr = [val];
    }
    
    if(io === "input"){
      min = this.normalizedData.tensors.inputMin;
      max = this.normalizedData.tensors.inputMax;
    } else if( io === "output"){
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
    if(val instanceof Array){
      arr = val;
    } else {
      arr = [val];
    }
    
    if(io === "input"){
      min = this.normalizedData.tensors.inputMin;
      max = this.normalizedData.tensors.inputMax;
    } else if( io === "output"){
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