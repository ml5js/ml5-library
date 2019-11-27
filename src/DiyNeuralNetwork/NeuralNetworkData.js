import * as tf from '@tensorflow/tfjs';
import {
  saveBlob
} from '../utils/io';
// import callCallback from '../utils/callcallback';

class NeuralNetworkData {
  constructor() {
    this.config = {
      dataUrl: null,
    }

    this.meta = {
      // number of units - varies depending on input data type
      inputUnits: null,
      outputUnits: null,
      // objects describing input/output data by property name
      inputs: {}, // { name1: {dtype}, name2: {dtype}  }
      outputs: {}, // { name1: {dtype} }
      isNormalized: false,
    }

    this.isMetadataReady = false;
    this.isWarmedUp = false;


    this.data = {
      raw: [], // array of {xs:{}, ys:{}}
    }

  }


  /**
   * normalizeTensor
   * converts a tensor with data to normalized values ranging from 0-1.
   * @param {*} _input 
   * @param {*} _options 
   */
  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  normalizeTensor(_input, _options) {

  }

  /**
   * unNormalizeTensor
   * converts a normalized tensor from 0 to 1 back to the "natural" units
   * @param {*} _input 
   * @param {*} _options 
   */
  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  unNormalizeTensor(_input, _options) {


  }


  isNormalized(){
    return !this.meta.isNormalized;
  }


  /**
   * normalizeRaws
   * @param {*} dataRaw 
   * @param {*} inputOrOutputMeta 
   * @param {*} xsOrYs 
   */
  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  normalizeRaws(dataRaw, inputOrOutputMeta, xsOrYs) {
    const meta = Object.assign({}, inputOrOutputMeta);
    const dataLength = dataRaw.length;

    const normalized = {};
    Object.keys(meta).forEach(k => {
      const dataAsArray = this.arrayFromLabel(dataRaw, xsOrYs, k);
      const options = {
        min: meta[k].min,
        max: meta[k].max
      }
      if (meta[k].legend) options.legend = meta[k].legend;

      normalized[k] = this.normalizeArray(dataAsArray, options);
    });

    const output = [...new Array(dataLength).fill(null)].map((item, idx) => {
      const row = {
        [xsOrYs]: {}
      };
      Object.keys(meta).forEach(k => {
        row[xsOrYs][k] = normalized[k][idx];
      });
      return row;
    })

    return output;
  }

  /**
   * normalizeArray
   * @param {*} _input 
   * @param {*} _options 
   */
  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  normalizeArray(_input, _options) {
    const {
      min,
      max
    } = _options;
    const inputArray = [..._input];
    let normalized;

    if (!_input.every(v => typeof v === 'number')) {
      console.log({
        warn: 'not a numeric array, returning given value'
      })

      // if the data are onehot encoded, replace the string
      // value with the onehot array
      // if none exists, return the given value 
      if (_options.legend) {
        normalized = inputArray.map(v => {
          return _options.legend[v] ? _options.legend[v] : v;
        });
        return normalized
      }

      return inputArray;
    }

    normalized = inputArray.map(v => (v - min) / (max - min))
    return normalized;
  }

  /**
   * unNormalizeArray
   * @param {*} _input 
   * @param {*} _options 
   */
  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  unNormalizeArray(_input, _options) {
    const {
      min,
      max
    } = _options;
    const inputArray = [..._input];
    let unNormalized;

    if (!_input.every(v => typeof v === 'number')) {
      console.log({
        warn: 'not a numeric array, returning given value'
      })

      if (_options.legend) {
        console.log("yes!")
        unNormalized = inputArray.map(v => {
          let res;
          Object.entries(_options.legend).forEach(item => {
            const key = item[0];
            const val = item[1];
            const matches = v.map((num, idx) => num === val[idx]).every(truthy => truthy === true);
            if (matches) res = key;
          })
          return res;
        })

        // unNormalized = inputArray.map(v => _options.legend[v]);
        return unNormalized
      }

      return inputArray;
    }

    unNormalized = inputArray.map(v => ((v * (max - min)) + min))
    return unNormalized;
  }


  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  getTensorStats() {

  }

  /**
   * getRawStats
   * get back the min and max of each label
   * @param {*} dataRaw 
   * @param {*} inputOrOutputMeta 
   * @param {*} xsOrYs 
   */
  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  getRawStats(dataRaw, inputOrOutputMeta, xsOrYs) {
    const meta = Object.assign({}, inputOrOutputMeta);

    Object.keys(meta).forEach(k => {
      const dataAsArray = this.arrayFromLabel(dataRaw, xsOrYs, k);
      if (meta[k].dtype !== 'number') {
        meta[k].min = 0;
        meta[k].max = 1;
      } else {
        meta[k].min = this.getMin(dataAsArray);
        meta[k].max = this.getMax(dataAsArray);
      }
    });

    return meta;
  }

  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  applyOneHotEncodingsToDataRaw(_dataRaw = null, _meta = null){
    let dataRaw = _dataRaw === null ? this.data.raw : _dataRaw;
    const meta = _meta === null ? this.meta : _meta;

    dataRaw = dataRaw.map(row => {

      const xs = {...row.xs}
      const ys = {...row.ys}
      // get xs
      Object.keys(meta.inputs).forEach(k => {
        if (meta.inputs[k].legend) {
          xs[k] = meta.inputs[k].legend[row.xs[k]]
        }
      });

      Object.keys(meta.outputs).forEach(k => {
        if (meta.outputs[k].legend) {
          ys[k] = meta.outputs[k].legend[row.ys[k]]
        }
      });

      return {xs, ys}
    })

    // this.data.raw = dataRaw;

    return dataRaw;

  }


  /**
   * convertRawToTensors
   * converts array of {xs, ys} to tensors
   * @param {*} _dataRaw 
   * @param {*} meta 
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  convertRawToTensors(_dataRaw = null, _meta = null ) {
    const dataRaw = _dataRaw === null ? this.data.raw : _dataRaw;
    const meta = _meta === null ? this.meta : _meta;
    const dataLength = dataRaw.length;

    return tf.tidy(() => {

      const inputArr = [];
      const outputArr = [];

      dataRaw.forEach(row => {
        // get xs
        const xs = Object.keys(meta.inputs).map(k => {
          return row.xs[k]
        });
        inputArr.push(...xs)

        // get ys
        const ys = Object.keys(meta.outputs).map(k => {
          return row.ys[k]
        })
        outputArr.push(...ys)
      })

      const inputs = tf.tensor(inputArr, [dataLength, meta.inputUnits])
      const outputs = tf.tensor(outputArr, [dataLength, meta.outputUnits])

      return {
        inputs,
        outputs
      };
    })
  }

  /**
   * Returns a legend mapping the 
   * data values to oneHot encoded values
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  createOneHotEncodings(_uniqueValuesArray) {
    return tf.tidy(() => {
      const output = {
        uniqueValues: _uniqueValuesArray,
        legend: {}
      }

      const uniqueVals = _uniqueValuesArray // [...new Set(this.data.raw.map(obj => obj.xs[prop]))]
      // get back values from 0 to the length of the uniqueVals array
      const onehotValues = uniqueVals.map((item, idx) => idx);
      // oneHot encode the values in the 1d tensor
      const oneHotEncodedValues = tf.oneHot(tf.tensor1d(onehotValues, 'int32'), uniqueVals.length);
      // convert them from tensors back out to an array
      const oneHotEncodedValuesArray = oneHotEncodedValues.arraySync();

      // populate the legend with the key/values
      uniqueVals.forEach((uVal, uIdx) => {
        output.legend[uVal] = oneHotEncodedValuesArray[uIdx]
      });

      return output
    })
  }

  /**
   * createMetaDataFromData
   * returns an object with:
   * {
   *  inputUnits: Number
   *  outputUnits: Number
   *  inputs: {label:{dtypes:String, [?uniqueValues], {?legend} }}
   *  outputs: {label:{dtypes:String, [?uniqueValues], {?legend} }}
   * }
   * @param {*} _dataRaw 
   */
  createMetaDataFromData(_dataRaw) {
    // get dtypes
    const meta = this.getDTypesFromData(_dataRaw);
    meta.inputs = this.getOneHotMeta(meta.inputs, _dataRaw, 'xs');
    meta.outputs = this.getOneHotMeta(meta.outputs, _dataRaw, 'ys');
    meta.inputUnits = this.calculateInputUnitsFromData(meta.inputs, _dataRaw)
    meta.outputUnits = this.calculateInputUnitsFromData(meta.outputs, _dataRaw)

    this.meta = {
      ...meta
    };
    // outputs
    return meta;

  }

  /**
   * getOneHotMeta
   * @param {*} _inputsMeta 
   * @param {*} _dataRaw 
   * @param {*} xsOrYs 
   */
  getOneHotMeta(_inputsMeta, _dataRaw, xsOrYs) {

    const inputsMeta = Object.assign({}, _inputsMeta);

    Object.entries(inputsMeta).forEach(arr => {
      const key = arr[0];
      const {
        dtype
      } = arr[1];

      if (dtype === 'string') {
        const uniqueVals = [...new Set(_dataRaw.map(obj => obj[xsOrYs][key]))]
        const oneHotMeta = this.createOneHotEncodings(uniqueVals);
        inputsMeta[key] = {
          ...inputsMeta[key],
          ...oneHotMeta
        }
      }
    })

    return inputsMeta;
  }


  /**
   * calculateInputUnitsFromData
   * @param {*} _inputsMeta 
   * @param {*} _dataRaw 
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  calculateInputUnitsFromData(_inputsMeta, _dataRaw) {
    let units = 0;

    const inputsMeta = Object.assign({}, _inputsMeta);

    Object.entries(inputsMeta).forEach(arr => {
      const {
        dtype
      } = arr[1];
      if (dtype === 'number') {
        units += 1;
      } else if (dtype === 'string') {
        const uniqueCount = arr[1].uniqueValues.length;
        units += uniqueCount
      }
    })

    return units;
  }

  /**
   * getDTypesFromData
   * gets the data types of the data we're using
   * important for handling oneHot
   */
  // eslint-disable-next-line class-methods-use-this
  getDTypesFromData(_dataRaw) {
    const meta = {
      inputs: {},
      outputs: {}
    }

    // TODO: check if all entries have the
    // same dtype.
    // for now assume that the first row of 
    // data represents the dtype for all
    const sample = _dataRaw[0];
    const xs = Object.keys(sample.xs);
    const ys = Object.keys(sample.ys);

    xs.forEach((prop) => {
      meta.inputs[prop] = {
        dtype: typeof sample.xs[prop]
      }
    });

    ys.forEach((prop) => {
      meta.outputs[prop] = {
        dtype: typeof sample.ys[prop]
      }
    });

    return meta;
  }

  /**
   * loadCSV
   * @param {*} _dataUrl 
   * @param {*} _inputLabelsArray 
   * @param {*} _outputLabelsArray 
   */
  // eslint-disable-next-line class-methods-use-this
  async loadCSV(_dataUrl, _inputLabelsArray, _outputLabelsArray) {
    try {
      const path = _dataUrl;
      const myCsv = tf.data.csv(path);
      const loadedData = await myCsv.toArray();
      const json = {
        entries: loadedData
      }
      this.loadJSON(json, _inputLabelsArray, _outputLabelsArray);
    } catch (err) {
      console.error('error loading csv', err);
    }
  }

  /**
   * loadJSON
   * @param {*} _dataUrlOrJson 
   * @param {*} _inputLabelsArray 
   * @param {*} _outputLabelsArray 
   */
  // eslint-disable-next-line class-methods-use-this
  async loadJSON(_dataUrlOrJson, _inputLabelsArray, _outputLabelsArray) {
    try {
      const outputLabels = _outputLabelsArray;
      const inputLabels = _inputLabelsArray;

      let json;
      // handle loading parsedJson
      if (_dataUrlOrJson instanceof Object) {
        json = _dataUrlOrJson;
      } else {
        const data = await fetch(_dataUrlOrJson);
        json = await data.json();
      }

      // format the data.raw array
      this.formatRawData(json, inputLabels, outputLabels);

    } catch (err) {
      console.error("error loading json", err);
    }
  }

  /**
   * formatRawData
   * takes a json and set the this.data.raw
   * @param {*} _json 
   * @param {*} _inputLabelsArray 
   * @param {*} _outputLabelsArray 
   */
  formatRawData(_json, _inputLabelsArray, _outputLabelsArray) {
    const outputLabels = _outputLabelsArray;
    const inputLabels = _inputLabelsArray;
    // Recurse through the json object to find 
    // an array containing `entries` or `data`
    const dataArray = this.findEntries(_json);

    if (!dataArray.length > 0) {
      console.log(`your data must be contained in an array in \n
        a property called 'entries' or 'data' of your json object`);
    }

    // create an array of json objects [{xs,ys}]
    const result = dataArray.map((item, idx) => {
      const output = {
        xs: {},
        ys: {}
      }

      inputLabels.forEach(k => {
        if (item[k] !== undefined) {
          output.xs[k] = item[k];
        } else {
          console.error(`the input label ${k} does not exist at row ${idx}`)
        }
      })

      outputLabels.forEach(k => {
        if (item[k] !== undefined) {
          output.ys[k] = item[k];
          // TODO: convert ys into strings, if the task is classification
          // if (this.config.architecture.task === "classification" && typeof output.ys[prop] !== "string") {
          //   output.ys[prop] += "";
          // }
        } else {
          console.error(`the output label ${k} does not exist at row ${idx}`)
        }
      })

      return output;
    });

    // set this.data.raw
    this.data.raw = result;

  }

  /**
   * loadBlob
   * @param {*} _dataUrlOrJson 
   * @param {*} _inputLabelsArray 
   * @param {*} _outputLabelsArray 
   */
  // eslint-disable-next-line class-methods-use-this
  async loadBlob(_dataUrlOrJson, _inputLabelsArray, _outputLabelsArray) {
    try {
      const data = await fetch(_dataUrlOrJson);
      const text = await data.text();

      if (this.isJsonOrString(text)) {
        const json = JSON.parse(text);
        await this.loadJSON(json, _inputLabelsArray, _outputLabelsArray);
      } else {
        const json = this.csvToJSON(text);
        await this.loadJSON(json, _inputLabelsArray, _outputLabelsArray);
      }

    } catch (err) {
      console.log('mmm might be passing in a string or something!', err)
    }
  }

  /**
   * csvToJSON
   * Creates a csv from a string
   * @param {*} csv
   */
  // via: http://techslides.com/convert-csv-to-json-in-javascript
  // eslint-disable-next-line class-methods-use-this
  csvToJSON(csv) {
    // split the string by linebreak
    const lines = csv.split("\n");
    const result = [];
    // get the header row as an array
    const headers = lines[0].split(",");

    // iterate through every row
    for (let i = 1; i < lines.length; i += 1) {
      // create a json object for each row
      const row = {};
      // split the current line into an array
      const currentline = lines[i].split(",");

      // for each header, create a key/value pair 
      headers.forEach((k, idx) => {
        row[k] = currentline[idx]
      });
      // add this to the result array
      result.push(row);
    }

    return {
      entries: result
    }

  }

  /**
   * addData
   * nn.neuralNetworkData.addData([255, 0,0], ['red-ish'], {
   * inputLabels:['r', 'g', 'b'], outputLabels:['label']
   * })
   * @param {*} xInputs 
   * @param {*} yInputs 
   * @param {*} options 
   */
  // eslint-disable-next-line class-methods-use-this
  addData(xInputs, yInputs, options) {
    
    function getLabelsFromIncoming(incoming, prefix){
      let labels;
      if (Array.isArray(incoming)) {
        labels = incoming.map( (v,idx) => `${prefix}_${idx}` )
      } else if (typeof incoming === 'object'){
        labels = Object.keys(incoming).map( (v,idx) => `${prefix}_${idx}` )
      }
      return labels;
    }
    
    function formatIncomingData(incoming, labels) {
      let result = {};
      if (Array.isArray(incoming)) {
        incoming.forEach((item, idx) => {
          const label = labels[idx];
          result[label] = item;
        });
        return result;
      } else if (typeof incoming === 'object') {
        result = incoming;
        return result;
      }

      throw new Error('input provided is not supported or does not match your output label specifications')
    }

    let inputLabels;
    let outputLabels;

    if(options && options !== null ){
      // eslint-disable-next-line prefer-destructuring
      inputLabels = options.inputLabels;
      // eslint-disable-next-line prefer-destructuring
      outputLabels = options.outputLabels;
    } else {
      inputLabels = getLabelsFromIncoming(xInputs, 'input')
      outputLabels = getLabelsFromIncoming(yInputs, 'output')
    }

    const inputs = formatIncomingData(xInputs, inputLabels);
    const outputs = formatIncomingData(yInputs, outputLabels);

    this.data.raw.push({
      xs: inputs,
      ys: outputs
    });
  }

  /**
   * saveData
   * @param {*} name 
   */
  // eslint-disable-next-line class-methods-use-this
  async saveData(name) {
    const today = new Date();
    const date = `${String(today.getFullYear())}-${String(today.getMonth()+1)}-${String(today.getDate())}`;
    const time = `${String(today.getHours())}-${String(today.getMinutes())}-${String(today.getSeconds())}`;
    const datetime = `${date}_${time}`;

    let dataName = datetime;
    if (name) dataName = name;

    const output = {
      data: this.data.raw
    }

    await saveBlob(JSON.stringify(output), `${dataName}.json`, 'text/plain');
  }


  /*
   * ****************
   * helper functions 
   * **************** 
   */

  /**
   * findEntries
   * recursively attempt to find the entries
   * or data array for the given json object
   * @param {*} _data 
   */
  // eslint-disable-next-line class-methods-use-this
  findEntries(_data) {

    const parentCopy = Object.assign({}, _data);

    if (parentCopy.entries && parentCopy.entries instanceof Array) {
      return parentCopy.entries
    } else if (parentCopy.data && parentCopy.data instanceof Array) {
      return parentCopy.data
    }

    const keys = Object.keys(parentCopy);
    // eslint-disable-next-line consistent-return
    keys.forEach(k => {
      if (typeof parentCopy[k] === 'object') {
        return this.findEntries(parentCopy[k])
      }
    })

    return parentCopy;
  }

  /**
   * checks whether or not a string is a json
   * @param {*} str
   */
  // eslint-disable-next-line class-methods-use-this
  isJsonOrString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  /**
   * getMin
   * @param {*} _array 
   */
  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  getMin(_array) {
    return Math.min(..._array)
  }

  /**
   * getMax
   * @param {*} _array 
   */
  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  getMax(_array) {
    return Math.max(..._array)
  }

  /**
   * arrayFromLabel
   * @param {*} dataRaw 
   * @param {*} xsOrYs 
   * @param {*} label 
   */
  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  arrayFromLabel(dataRaw, xsOrYs, label) {
    return dataRaw.map(item => item[xsOrYs][label]);
  }

  /**
   * zipArrays
   * @param {*} arr1 
   * @param {*} arr2 
   */
  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  zipArrays(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      console.error('arrays do not have the same length')
      return [];
    }

    const output = [...new Array(arr1.length).fill(null)].map((item, idx) => {
      return {
        ...arr1[idx],
        ...arr2[idx]
      }
    })

    return output;

  }

}

export default NeuralNetworkData;