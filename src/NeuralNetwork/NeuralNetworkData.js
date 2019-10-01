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
      normalized: [], // TODO: should we keep normalized?
      tensor: []
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
    const json = {entries: loadedData}
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

  // eslint-disable-next-line class-methods-use-this
  isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

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



} // end of class


export default NeuralNetworkData;