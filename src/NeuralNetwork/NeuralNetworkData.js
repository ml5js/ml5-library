import * as tf from '@tensorflow/tfjs';
// import * as tfvis from '@tensorflow/tfjs-vis';
// import callCallback from '../utils/callcallback';

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["shuffle", "normalizeArray"] }] */
class NeuralNetworkData {
  constructor(options) {
    this.config = options;
    this.meta = {
      // number of units - varies depending on input data type
      inputUnits: null,
      outputUnits: null,
      // objects describing input/output data by property name
      inputs: {}, // { name1: {dtype}, name2: {dtype}  }
      outputs: {}, // { name1: {dtype} }
    }

    this.data = {
      raw: [],
      tensor: {
        inputs: null, // tensor
        outputs: null, // tensor
        inputMax: null, // tensor
        inputMin: null, // tensor
        outputMax: null, // tensor
        outputMin: null, // tensor
      },
    }

    if (options.dataOptions.normalizationOptions) {
      this.data.inputMax = options.dataOptions.normalizationOptions.inputMax || null; // array or number
      this.data.inputMin = options.dataOptions.normalizationOptions.inputMin || null; // array or number
      this.data.outputMax = options.dataOptions.normalizationOptions.outputMax || null; // array or number
      this.data.outputMin = options.dataOptions.normalizationOptions.outputMin || null; // array or number
    }
  }

  /**
   * load data
   */
  async loadData() {
    const {
      dataUrl
    } = this.config.dataOptions;
    if (dataUrl.endsWith('.csv')) {
      await this.loadCSVInternal();
    } else if (dataUrl.endsWith('.json')) {
      await this.loadJSONInternal();
    } else if (dataUrl.includes('blob')) {
      await this.loadBlobInternal()
    } else {
      console.log('Not a valid data format. Must be csv or json')
    }
  }

  /**
   * load csv
   * TODO: pass to loadJSONInternal()
   */
  async loadCSVInternal() {
    const path = this.config.dataOptions.dataUrl;
    const myCsv = tf.data.csv(path);
    const loadedData = await myCsv.toArray();
    const json = {
      entries: loadedData
    }
    this.loadJSONInternal(json);
  }

  /**
   * load json data
   * @param {*} parsedJson
   */
  async loadJSONInternal(parsedJson) {
    const {
      dataUrl
    } = this.config.dataOptions;
    const outputLabels = this.config.dataOptions.outputs;
    const inputLabels = this.config.dataOptions.inputs;

    let json;
    // handle loading parsedJson
    if (parsedJson instanceof Object) {
      json = parsedJson;
    } else {
      const data = await fetch(dataUrl);
      json = await data.json();
    }

    // TODO: recurse through the object to find
    // which object contains the
    let parentProp;
    if (Object.keys(json).includes('entries')) {
      parentProp = 'entries'
    } else if (Object.keys(json).includes('data')) {
      parentProp = 'data'
    } else {
      console.log(`your data must be contained in an array in \n
      a property called 'entries' or 'data'`);
      return;
    }

    const dataArray = json[parentProp];

    this.data.raw = dataArray.map((item) => {

      const output = {
        xs: {},
        ys: {}
      }
      // TODO: keep an eye on the order of the
      // property name order if you use the order
      // later on in the code!
      const props = Object.keys(item);

      props.forEach(prop => {
        if (inputLabels.includes(prop)) {
          output.xs[prop] = item[prop]
        }

        if (outputLabels.includes(prop)) {
          output.ys[prop] = item[prop]
        }
      })

      return output;
    })

    // set the data types for the inputs and outputs
    this.setDTypes();

  }

  /**
   * load a blob and check if it is json
   */
  async loadBlobInternal() {
    try {
      const data = await fetch(this.config.dataUrl);
      const text = await data.text();
      if (this.isJsonString(text)) {
        const json = JSON.parse(text);
        await this.loadJSONInternal(json);
      } else {
        const json = this.csvJSON(text);
        await this.loadJSONInternal(json);
      }
    } catch (err) {
      console.log('mmm might be passing in a string or something!', err)
    }
  }

  /**
   * sets the data types of the data we're using
   * important for handling oneHot
   */
  setDTypes() {
    // this.meta.inputs
    const sample = this.data.raw[0];
    const xs = Object.keys(sample.xs);
    const ys = Object.keys(sample.ys);

    xs.forEach((prop) => {
      this.meta.inputs[prop] = {
        dtype: typeof sample.xs[prop]
      }
    });

    ys.forEach((prop) => {
      this.meta.outputs[prop] = {
        dtype: typeof sample.ys[prop]
      }
    });

  }

  /**
   * Get the input and output units
   *
   */
  getIOUnits() {
    let inputUnits = 0;
    let outputUnits = 0;

    // TODO: turn these into functions!
    // calc the number of inputs/output units
    Object.entries(this.meta.inputs).forEach(arr => {
      const {
        dtype
      } = arr[1];
      const prop = arr[0];
      if (dtype === 'number') {
        inputUnits += 1;
      } else if (dtype === 'string') {
        const uniqueVals = [...new Set(this.data.raw.map(obj => obj.xs[prop]))]
        // Store the unqiue values
        this.meta.inputs[prop].uniqueValues = uniqueVals;
        const onehotValues = [...new Array(uniqueVals.length).fill(null).map((item, idx) => idx)];

        const oneHotEncodedValues = tf.oneHot(tf.tensor1d(onehotValues, 'int32'), uniqueVals.length);
        const oneHotEncodedValuesArray = oneHotEncodedValues.arraySync();

        this.meta.inputs[prop].legend = {};
        uniqueVals.forEach((uVal, uIdx) => {
          this.meta.inputs[prop].legend[uVal] = oneHotEncodedValuesArray[uIdx]
        });

        // increment the number of inputs/outputs
        inputUnits += uniqueVals.length;
      }
    })


    // calc the number of inputs/output units
    Object.entries(this.meta.outputs).forEach(arr => {
      const {
        dtype
      } = arr[1];
      const prop = arr[0];
      if (dtype === 'number') {
        outputUnits += 1;
      } else if (dtype === 'string') {
        const uniqueVals = [...new Set(this.data.raw.map(obj => obj.ys[prop]))]
        // Store the unqiue values
        this.meta.outputs[prop].uniqueValues = uniqueVals;
        const onehotValues = [...new Array(uniqueVals.length).fill(null).map((item, idx) => idx)];

        const oneHotEncodedValues = tf.oneHot(tf.tensor1d(onehotValues, 'int32'), uniqueVals.length);
        const oneHotEncodedValuesArray = oneHotEncodedValues.arraySync();

        this.meta.outputs[prop].legend = {};
        uniqueVals.forEach((uVal, uIdx) => {
          this.meta.outputs[prop].legend[uVal] = oneHotEncodedValuesArray[uIdx]
        });

        // increment the number of inputs/outputs
        outputUnits += uniqueVals.length;
      }
    })

    this.meta.inputUnits = inputUnits;
    this.meta.outputUnits = outputUnits;
  }

  /**
   * Takes in a number or array and then either returns
   * the array or returns an array of ['input0','input1']
   * the array or returns an array of ['output0','output1']
   * @param {*} val
   * @param {*} inputType
   */
  // eslint-disable-next-line class-methods-use-this
  createNamedIO(val, inputType) {
    const arr = (val instanceof Array) ? val : [...new Array(val).fill(null).map((item, idx) => `${inputType}${idx}`)]
    return arr;
  }

  /**
   * checks whether or not a string is a json
   * @param {*} str
   */
  // eslint-disable-next-line class-methods-use-this
  isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }


  /**
   * Creates a csv from a strin
   * @param {*} csv
   */
  // via: http://techslides.com/convert-csv-to-json-in-javascript
  // eslint-disable-next-line class-methods-use-this
  csvJSON(csv) {

    const lines = csv.split("\n");

    const result = [];

    const headers = lines[0].split(",");

    for (let i = 1; i < lines.length; i += 1) {

      const obj = {};
      const currentline = lines[i].split(",");

      for (let j = 0; j < headers.length; j += 1) {
        obj[headers[j]] = currentline[j];
      }
      result.push(obj);
    }

    return {
      entries: result
    }
  }

  /**
   * Takes data as an array
   * @param {*} xArray
   * @param {*} yArray
   */
  addData(xArray, yArray) {
    const inputs = {};
    const outputs = {};

    xArray.forEach((item, idx) => {
      // TODO: get the label from the inputs?
      const label = `input${idx}`;
      inputs[label] = item;
    });

    yArray.forEach((item, idx) => {
      // TODO: get the label from the outputs?
      const label = `output${idx}`;
      outputs[label] = item;
    });

    this.data.raw.push({
      xs: inputs,
      ys: outputs
    });
  }

  /**
   * normalize the data.raw
   */
  normalize() {

    // always make sure to check set the data types
    this.setDTypes();
    // always make sure that the IO units are set
    this.getIOUnits();

    // do the things...!
    const {
      inputTensor,
      outputTensor
    } = this.convertRawToTensor();


    inputTensor.print()
    inputTensor.print()

    // run normalize on the new tensors
    const {
      normalizedInputs,
      normalizedOutputs,
      inputMax,
      inputMin,
      outputMax,
      outputMin
    } = this.normalizeInternal(inputTensor, outputTensor);

    // normalizedInputs.print()
    // normalizedOutputs.print()
    // inputMax.print()
    // inputMin.print()
    // outputMax.print()
    // outputMin.print()

    // set the tensor data to the normalized inputs
    this.data.tensor = {
      inputs: normalizedInputs,
      outputs: normalizedOutputs,
      inputMax,
      inputMin,
      outputMax,
      outputMin,
    }

    // set the input/output Min and max values as numbers
    this.data.inputMin = inputMin.arraySync();
    this.data.inputMax = inputMax.arraySync();
    this.data.outputMax = outputMax.arraySync();
    this.data.outputMin = outputMin.arraySync();

  }

  /**
   *
   */
  normalizeInternal(inputTensor, outputTensor) {
    // inputTensor.print()
    // outputTensor.print()

    // 4. Get the min and max values for normalization
    // TODO: allow people to submit their own normalization values!
    let inputMax;
    let inputMin;
    let outputMax;
    let outputMin;

    if (this.config.architecture.task === 'regression') {
      // if the task is a regression, return all the
      // output stats as an array
      inputMax = inputTensor.max(0);
      inputMin = inputTensor.min(0);
      outputMax = outputTensor.max(0);
      outputMin = outputTensor.min(0);
    } else if (this.config.architecture.task === 'classification') {
      // if the task is a classification, return the single value
      inputMax = inputTensor.max(0);
      inputMin = inputTensor.min(0);
      outputMax = outputTensor.max();
      outputMin = outputTensor.min();
    }

    // TODO: refine this custom normalization function option
    // Experimental!!!!
    if (this.config.dataOptions.normalizationOptions instanceof Object) {
      inputMax = tf.tensor1d(this.data.inputMax);
      inputMin = tf.tensor1d(this.data.inputMin);
      // outputMax = tf.tensor1d(this.data.outputMax);
      // outputMin = tf.tensor1d(this.data.outputMin);
    }

    // 5. create a normalized tensor
    const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
    const normalizedOutputs = outputTensor.sub(outputMin).div(outputMax.sub(outputMin));

    return {
      normalizedInputs,
      normalizedOutputs,
      inputMin,
      inputMax,
      outputMax,
      outputMin
    }
  }

  /**
   * onehot encode values
   */
  convertRawToTensor() {
    console.log(this.meta)

    // Given the inputs and output types,
    // now create the input and output tensors
    // 1. start by creating a matrix
    const inputs = []
    const outputs = [];

    // 2. encode the values
    // iterate through each entry and send the correct
    // oneHot encoded values or the numeric value
    this.data.raw.forEach((item) => {
      let inputRow = [];
      let outputRow = [];
      const {
        xs,
        ys
      } = item;

      // Create the inputs matrix
      Object.entries(xs).forEach((valArray) => {
        const prop = valArray[0];
        const val = valArray[1];
        const {
          dtype
        } = this.meta.inputs[prop];

        if (dtype === 'number') {
          inputRow.push(val);
        } else if (dtype === 'string') {
          const oneHotArray = this.meta.inputs[prop].legend[val];
          inputRow = [...inputRow, ...oneHotArray];
        }

      });

      // Create the outputs matrix
      Object.entries(ys).forEach((valArray) => {
        const prop = valArray[0];
        const val = valArray[1];
        const {
          dtype
        } = this.meta.outputs[prop];

        if (dtype === 'number') {
          outputRow.push(val);
        } else if (dtype === 'string') {
          const oneHotArray = this.meta.outputs[prop].legend[val];
          outputRow = [...outputRow, ...oneHotArray];
        }

      });

      inputs.push(inputRow);
      outputs.push(outputRow);

    });

    // console.log(inputs, outputs)
    // 3. convert to tensors
    const inputTensor = tf.tensor(inputs, [this.data.raw.length, this.meta.inputUnits]);
    const outputTensor = tf.tensor(outputs, [this.data.raw.length, this.meta.outputUnits]);

    return {
      inputTensor,
      outputTensor
    }

  }


} // end of class


export default NeuralNetworkData;