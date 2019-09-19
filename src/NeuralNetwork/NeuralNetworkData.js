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
  
    /* eslint class-methods-use-this: ["error", { "exceptMethods": ["shuffle"] }] */
    shuffle() {
      if (this.data === null) {
        this.data = [...new Array(this.xs.length).fill(null).map((item, idx) => ({
          xs: this.xs[idx],
          ys: this.ys[idx]
        }))]
      }
      tf.util.shuffle(this.data);
    }
  
    normalize() {
      if (this.data === null) {
        this.data = [...new Array(this.xs.length).fill(null).map((item, idx) => ({
          xs: this.xs[idx],
          ys: this.ys[idx]
        }))]
      }
  
      const outputLabels = this.outputs;
      const inputLabels = this.inputs;
      const outputLabel = outputLabels[0];    
  
      // !!!! TODO: need to test this for regression data. !!!!!
  

      // Step 2. Convert data to Tensor
      const inputs = inputLabels.map(header => this.data.map(d => d.xs[header]))
      const targets = this.data.map(d => d.ys[outputLabel]);
  
      
      const inputTensor = tf.tensor(inputs);
  
      // TODO: OneHot needs to check BOTH inputs and targets
  
      let outputTensor;
      if (this.task === 'classification') {
        const uniqueTargets = [...new Set(targets)]
        const oneHotTargets = targets.map(target => uniqueTargets.indexOf(target));
        console.log(oneHotTargets)
        outputTensor = tf.oneHot(tf.tensor1d(oneHotTargets, 'int32'), this.meta.outputUnits);
      } else {
        outputTensor = tf.tensor(targets);
      }
  
  
      // // Step 3. Normalize the data to the range 0 - 1 using min-max scaling
      const inputMax = inputTensor.max();
      const inputMin = inputTensor.min();
      const targetMax = outputTensor.max();
      const targetMin = outputTensor.min();
  
      const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin)).flatten().reshape([this.data.length, this.meta.inputUnits]);
  
      // console.log()
      const normalizedOutputs = outputTensor.sub(targetMin).div(targetMax.sub(targetMin));
  
      inputTensor.print();
      outputTensor.print()
  
      this.normalizedData = {
        inputs: normalizedInputs, // normalizedInputs,
        targets: normalizedOutputs,
        // Return the min/max bounds so we can use them later.
        inputMax,
        inputMin,
        targetMax,
        targetMin,
      }
      // });
    }
  
    normalizeOne(arr){
      const inputTensor = tf.tensor1d(arr);
      const normTensor = inputTensor.sub(this.normalizedData.inputMin).div(this.normalizedData.inputMax.sub(this.normalizedData.inputMin));
      // const normVals= normTensor
      //   .mul(this.normalizedData.inputMax.sub(this.normalizedData.targetMin))
      //   .add(this.normalizedData.targetMin);
      return normTensor.dataSync()
    }
  
    unNormalize(result){  
      const unNormPreds = result
        .mul(this.normalizedData.targetMax.sub(this.normalizedData.targetMin))
        .add(this.normalizedData.targetMin);
     
      return unNormPreds.dataSync();
    }
  
    addData(xs, ys) {
      this.xs.push(xs);
      this.ys.push(ys);
    }
  
  }


export default NeuralNetworkData;