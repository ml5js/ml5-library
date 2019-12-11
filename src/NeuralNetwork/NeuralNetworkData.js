import * as tf from '@tensorflow/tfjs';
import {
  saveBlob
} from '../utils/io';
import nnUtils from './NeuralNetworkUtils';

class NeuralNetworkData {
  constructor() {

    this.meta = {
      inputUnits: null, // Number
      outputUnits: null, // Number
      // objects describing input/output data by property name
      inputs: {}, // { name1: {dtype}, name2: {dtype}  }
      outputs: {}, // { name1: {dtype} }
      isNormalized: false, // Boolean - keep this in meta for model saving/loading
    }

    this.isMetadataReady = false;
    this.isWarmedUp = false;

    this.data = {
      raw: [], // array of {xs:{}, ys:{}}
    }

  }

  /**
   * ////////////////////////////////////////////////////////
   * Mutations
   * ////////////////////////////////////////////////////////
   */

  setDataRaw(data) {
    this.data.raw = data;
  }

  setIsMetadataReady(bool) {
    this.isMetadataReady = bool;
  }

  setIsWarmedUp(bool) {
    this.isWarmedUp = bool;
  }

  setMetaInputUnits(num) {
    this.meta.inputUnits = num;
  }

  setMetaOutputUnits(num) {
    this.meta.outputUnits = num;
  }

  setMetaInputs(obj) {
    this.meta.inputs = obj;
  }

  setMetaOutputs(obj) {
    this.meta.outputs = obj;
  }

  setMetaIsNormalized(bool) {
    this.meta.isNormalized = bool;
  }


  /**
   * Add Data
   * @param {object} xInputObj, {key: value}, key must be the name of the property value must be a String, Number, or Array
   * @param {*} yInputObj, {key: value}, key must be the name of the property value must be a String, Number, or Array
   */
  addData(xInputObj, yInputObj) {
    this.data.raw.push({
      xs: xInputObj,
      ys: yInputObj
    });
  }

  /**
   * ////////////////////////////////////////////////////////
   * Actions
   * ////////////////////////////////////////////////////////
   */

  // /**
  //  * createMetaDataFromData
  //  * returns an object with:
  //  * {
  //  *  inputUnits: Number
  //  *  outputUnits: Number
  //  *  inputs: {label:{dtypes:String, [?uniqueValues], {?legend} }}
  //  *  outputs: {label:{dtypes:String, [?uniqueValues], {?legend} }}
  //  * }
  //  * @param {*} _dataRaw 
  //  */
  // createMetaDataFromData(_dataRaw) {
  //   // get dtypes
  //   const meta = this.getDTypesFromData(_dataRaw);
  //   meta.inputs = this.getOneHotMeta(meta.inputs, _dataRaw, 'xs');
  //   meta.outputs = this.getOneHotMeta(meta.outputs, _dataRaw, 'ys');
  //   meta.inputUnits = this.calculateInputUnitsFromData(meta.inputs, _dataRaw)
  //   meta.outputUnits = this.calculateInputUnitsFromData(meta.outputs, _dataRaw)

  //   this.meta = {
  //     ...meta
  //   };
  //   // outputs
  //   return meta;

  // }

  /**
   * ////////////////////////////////////////////////////////
   * Tensor handling
   * ////////////////////////////////////////////////////////
   */


  /**
   * convertRawToTensors
   * converts array of {xs, ys} to tensors
   * @param {*} _dataRaw 
   * @param {*} meta 
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  convertRawToTensors(dataRaw) {
    const meta = Object.assign({}, this.meta);
    const dataLength = dataRaw.length;

    return tf.tidy(() => {

      const inputArr = [];
      const outputArr = [];

      dataRaw.forEach(row => {
        // get xs
        const xs = Object.keys(meta.inputs).map(k => {
          return row.xs[k]
        }).flat();

        inputArr.push(xs)

        // get ys
        const ys = Object.keys(meta.outputs).map(k => {
          return row.ys[k]
        }).flat();

        outputArr.push(ys)
      })

      const inputs = tf.tensor(inputArr.flat(), [dataLength, ...meta.inputUnits])
      const outputs = tf.tensor(outputArr.flat(), [dataLength, meta.outputUnits])

      return {
        inputs,
        outputs
      };
    })
  }

  /* 
   * ////////////////////////////////////////////////
   * Data normalization handling
   * ////////////////////////////////////////////////
   */

  /**
   * normalize the dataRaw input
   * @param {*} dataRaw 
   */
  normalizeDataRaw(dataRaw) {
    const meta = Object.assign({}, this.meta);

    const normXs = this.normalizeInputData(dataRaw, meta.inputs, 'xs');
    const normYs = this.normalizeInputData(dataRaw, meta.outputs, 'ys');

    const normalizedData = nnUtils.zipArrays(normXs, normYs);

    return normalizedData;
  }

  /**
   * normalizeRaws
   * @param {*} dataRaw 
   * @param {*} inputOrOutputMeta 
   * @param {*} xsOrYs 
   */
  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  normalizeInputData(dataRaw, inputOrOutputMeta, xsOrYs) {
    // the data length
    const dataLength = dataRaw.length;
    // the copy of the inputs.meta[inputOrOutput]
    const inputMeta = Object.assign({}, inputOrOutputMeta);

    // normalized output object
    const normalized = {};
    Object.keys(inputMeta).forEach(k => {
      // get the min and max values
      const options = {
        min: inputMeta[k].min,
        max: inputMeta[k].max
      }

      const dataAsArray = dataRaw.map(item => item[xsOrYs][k]);
      // depending on the input type, normalize accordingly
      if (inputMeta[k].dtype === 'string') {
        options.legend = inputMeta[k].legend;
        normalized[k] = this.normalizeArray(dataAsArray, options);
      } else if (inputMeta[k].dtype === 'number') {
        normalized[k] = this.normalizeArray(dataAsArray, options);
      } else if (inputMeta[k].dtype === 'array') {
        normalized[k] = dataAsArray.map(item => this.normalizeArray(item, options));
      }

    });

    // create a normalized version of data.raws 
    const output = [...new Array(dataLength).fill(null)].map((item, idx) => {
      const row = {
        [xsOrYs]: {}
      };

      Object.keys(inputMeta).forEach(k => {
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
  normalizeArray(inputArray, options) {

    const {
      min,
      max
    } = options;

    // if the data are onehot encoded, replace the string
    // value with the onehot array
    // if none exists, return the given value 
    if (options.legend) {
      const normalized = inputArray.map(v => {
        return options.legend[v] ? options.legend[v] : v;
      });
      return normalized
    }

    // if the dtype is a number
    if (inputArray.every(v => typeof v === 'number')) {
      const normalized = inputArray.map(v => nnUtils.normalizeValue(v, min, max))
      return normalized;
    }

    // otherwise return the input array
    // return inputArray;
    throw new Error('error in inputArray of normalizeArray() function')
  }

  /**
   * unNormalizeArray
   * @param {*} _input 
   * @param {*} _options 
   */
  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  unnormalizeArray(inputArray, options) {

    const {
      min,
      max
    } = options;

    // if the data is onehot encoded then remap the 
    // values from those oneHot arrays
    if (options.legend) {
      const unnormalized = inputArray.map(v => {
        let res;
        Object.entries(options.legend).forEach(item => {
          const key = item[0];
          const val = item[1];
          const matches = v.map((num, idx) => num === val[idx]).every(truthy => truthy === true);
          if (matches) res = key;
        })
        return res;
      })

      return unnormalized
    }

    // if the dtype is a number
    if (inputArray.every(v => typeof v === 'number')) {
      const unnormalized = inputArray.map(v => nnUtils.unnormalizeValue(v, min, max))
      return unnormalized;
    }

    // otherwise return the input array
    // return inputArray;
    throw new Error('error in inputArray of normalizeArray() function')
  }



  /* 
   * ////////////////////////////////////////////////
   * data Summary
   * ////////////////////////////////////////////////
   */

  /**
   * get stats about the data
   * @param {*} dataRaw 
   */
  getDataStats(dataRaw) {
    const meta = Object.assign({}, this.meta)

    const inputMeta = this.getInputMetaStats(dataRaw, meta.inputs, 'xs');
    const outputMeta = this.getInputMetaStats(dataRaw, meta.outputs, 'ys');

    meta.inputs = inputMeta;
    meta.outputs = outputMeta;

    this.meta = {
      ...this.meta,
      ...meta
    };

    return meta;
  }

  /**
   * getRawStats
   * get back the min and max of each label
   * @param {*} dataRaw 
   * @param {*} inputOrOutputMeta 
   * @param {*} xsOrYs 
   */
  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  getInputMetaStats(dataRaw, inputOrOutputMeta, xsOrYs) {
    const inputMeta = Object.assign({}, inputOrOutputMeta);

    Object.keys(inputMeta).forEach(k => {

      if (inputMeta[k].dtype === 'string') {
        inputMeta[k].min = 0;
        inputMeta[k].max = 1;
      } else if (inputMeta[k].dtype === 'number') {
        const dataAsArray = dataRaw.map(item => item[xsOrYs][k]);
        inputMeta[k].min = nnUtils.getMin(dataAsArray);
        inputMeta[k].max = nnUtils.getMax(dataAsArray);
      } else if (inputMeta[k].dtype === 'array') {
        const dataAsArray = dataRaw.map(item => item[xsOrYs][k]).flat();
        inputMeta[k].min = nnUtils.getMin(dataAsArray);
        inputMeta[k].max = nnUtils.getMax(dataAsArray);
      }

    });

    return inputMeta;
  }

  /**
   * get the data units, inputshape and output units
   * @param {*} dataRaw 
   */
  getDataUnits(dataRaw, _arrayShape = null) {
    const arrayShape = _arrayShape !== null ? _arrayShape : undefined;
    const meta = Object.assign({}, this.meta);

    // if the data has a shape pass it in
    let inputShape;
    if (arrayShape) {
      inputShape = arrayShape;
    } else {
      inputShape = [this.getInputMetaUnits(dataRaw, meta.inputs)].flat();
    }

    const outputShape = this.getInputMetaUnits(dataRaw, meta.outputs);

    meta.inputUnits = inputShape;
    meta.outputUnits = outputShape;

    this.meta = {
      ...this.meta,
      ...meta
    };

    return meta;
  }

  /**
   * get input
   * @param {*} _inputsMeta 
   * @param {*} _dataRaw 
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  getInputMetaUnits(_dataRaw, _inputsMeta) {
    let units = 0;
    const inputsMeta = Object.assign({}, _inputsMeta);

    Object.entries(inputsMeta).forEach(arr => {
      const {
        dtype
      } = arr[1];
      if (dtype === 'number') {
        units += 1;
      } else if (dtype === 'string') {

        const {
          uniqueValues
        } = arr[1];

        const uniqueCount = uniqueValues.length;
        units += uniqueCount
      } else if (dtype === 'array') {
        // TODO: User must input the shape of the 
        // image size correctly. 
        units = []
      }
    })

    return units;
  }

  /**
   * getDTypesFromData
   * gets the data types of the data we're using
   * important for handling oneHot
   */
  getDTypesFromData(_dataRaw) {
    const meta = {
      ...this.meta,
      inputs: {},
      outputs: {}
    }

    const sample = _dataRaw[0];
    const xs = Object.keys(sample.xs);
    const ys = Object.keys(sample.ys);

    xs.forEach((prop) => {
      meta.inputs[prop] = {
        dtype: nnUtils.getDataType(sample.xs[prop])
      }
    });

    ys.forEach((prop) => {
      meta.outputs[prop] = {
        dtype: nnUtils.getDataType(sample.ys[prop])
      }
    });

    // TODO: check if all entries have the same dtype.
    // otherwise throw an error

    this.meta = meta;

    return meta;
  }


  /* 
   * ////////////////////////////////////////////////
   * One hot encoding handling
   * ////////////////////////////////////////////////
   */

  /**
   * applyOneHotEncodingsToDataRaw
   * does not set this.data.raws
   * but rather returns them
   * @param {*} _dataRaw 
   * @param {*} _meta 
   */
  applyOneHotEncodingsToDataRaw(dataRaw) {
    const meta = Object.assign({}, this.meta);

    const output = dataRaw.map(row => {

      const xs = {
        ...row.xs
      }
      const ys = {
        ...row.ys
      }
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

      return {
        xs,
        ys
      }
    })

    return output;
  }




  /**
   * getDataOneHot
   * creates onehot encodings for the input and outputs 
   * and adds them to the meta info
   * @param {*} dataRaw 
   */
  getDataOneHot(dataRaw) {
    const meta = Object.assign({}, this.meta)

    const inputMeta = this.getInputMetaOneHot(dataRaw, meta.inputs, 'xs');
    const outputMeta = this.getInputMetaOneHot(dataRaw, meta.outputs, 'ys');

    meta.inputs = inputMeta;
    meta.outputs = outputMeta;

    this.meta = {
      ...this.meta,
      ...meta
    };

    return meta;

  }

  /**
   * getOneHotMeta
   * @param {*} _inputsMeta 
   * @param {*} _dataRaw 
   * @param {*} xsOrYs 
   */
  getInputMetaOneHot(_dataRaw, _inputsMeta, xsOrYs) {

    const inputsMeta = Object.assign({}, _inputsMeta);

    Object.entries(inputsMeta).forEach(arr => {
      // the key
      const key = arr[0];
      // the value
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
    });

    return inputsMeta;
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
   * ////////////////////////////////////////////////
   * Data loading handling
   * ////////////////////////////////////////////////
   */

  /**
   * Loads data from a URL using the appropriate function
   * @param {*} dataUrl 
   * @param {*} inputs 
   * @param {*} outputs 
   */
  async loadDataFromUrl(dataUrl, inputs, outputs) {
    try {

      let result;

      if (dataUrl.endsWith('.csv')) {
        result = await this.loadCSV(dataUrl, inputs, outputs);
      } else if (dataUrl.endsWith('.json')) {
        result = await this.loadJSON(dataUrl, inputs, outputs);
      } else if (dataUrl.includes('blob')) {
        result = await this.loadBlob(dataUrl, inputs, outputs);
      } else {
        throw new Error('Not a valid data format. Must be csv or json')
      }

      return result;

    } catch (error) {
      console.error(error);
      throw new Error(error);
    }

  }

  /**
   * // TODO: convert ys into strings, if the task is classification
    // if (this.config.architecture.task === "classification" && typeof output.ys[prop] !== "string") {
    //   output.ys[prop] += "";
    // }
   * formatRawData
   * takes a json and set the this.data.raw
   * @param {*} json 
   * @param {Array} inputLabels
   * @param {Array} outputLabels
   */
  formatRawData(json, inputLabels, outputLabels) {
    // Recurse through the json object to find 
    // an array containing `entries` or `data`
    const dataArray = this.findEntries(json);

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
        } else {
          console.error(`the output label ${k} does not exist at row ${idx}`)
        }
      })

      return output;
    });

    // set this.data.raw
    this.setDataRaw(result);

    return result;
  }

  /**
   * loadJSON
   * @param {*} _dataUrlOrJson 
   * @param {*} _inputLabelsArray 
   * @param {*} _outputLabelsArray 
   */
  // eslint-disable-next-line class-methods-use-this
  async loadJSON(dataUrlOrJson, inputLabels, outputLabels) {
    try {
      let json;
      // handle loading parsedJson
      if (dataUrlOrJson instanceof Object) {
        json = Object.assign({}, dataUrlOrJson);
      } else {
        const data = await fetch(dataUrlOrJson);
        json = await data.json();
      }

      // format the data.raw array
      const result = this.formatRawData(json, inputLabels, outputLabels);
      return result;
    } catch (err) {
      console.error("error loading json");
      throw new Error(err);
    }
  }

  /**
   * loadCSV
   * @param {*} _dataUrl 
   * @param {*} _inputLabelsArray 
   * @param {*} _outputLabelsArray 
   */
  // eslint-disable-next-line class-methods-use-this
  async loadCSV(dataUrl, inputLabels, outputLabels) {
    try {
      const myCsv = tf.data.csv(dataUrl);
      const loadedData = await myCsv.toArray();
      const json = {
        entries: loadedData
      }
      // format the data.raw array
      const result = this.formatRawData(json, inputLabels, outputLabels);
      return result;

    } catch (err) {
      console.error('error loading csv', err);
      throw new Error(err);
    }
  }

  /**
   * loadBlob
   * @param {*} _dataUrlOrJson 
   * @param {*} _inputLabelsArray 
   * @param {*} _outputLabelsArray 
   */
  async loadBlob(dataUrlOrJson, inputLabels, outputLabels) {
    try {
      const data = await fetch(dataUrlOrJson);
      const text = await data.text();

      let result;
      if (nnUtils.isJsonOrString(text)) {
        const json = JSON.parse(text);
        result = await this.loadJSON(json, inputLabels, outputLabels);
      } else {
        const json = this.csvToJSON(text);
        result = await this.loadJSON(json, inputLabels, outputLabels);
      }

      return result;
    } catch (err) {
      console.log('mmm might be passing in a string or something!', err);
      throw new Error(err);
    }
  }

  /**
   * loadData from fileinput or path
   * @param {*} filesOrPath
   * @param {*} callback
   */
  async loadData(filesOrPath = null, callback) {
    try {
      let loadedData;

      if (typeof filesOrPath !== 'string') {
        const file = filesOrPath[0];
        const fr = new FileReader();
        fr.readAsText(file);
        if (file.name.includes('.json')) {
          const temp = await file.text();
          loadedData = JSON.parse(temp);
        } else {
          console.log('data must be a json object containing an array called "data" or "entries')
        }
      } else {
        loadedData = await fetch(filesOrPath);
        const text = await loadedData.text();
        if (this.isJsonString(text)) {
          loadedData = JSON.parse(text);
        } else {
          console.log('Whoops! something went wrong. Either this kind of data is not supported yet or there is an issue with .loadData')
        }
      }

      this.data.raw = this.findEntries(loadedData);

      // check if a data or entries property exists
      if (!this.data.raw.length > 0) {
        console.log('data must be a json object containing an array called "data" ')
      }

      if (callback) {
        callback();
      }

    } catch (error) {
      throw new Error(error);
    }

  }

  /** 
   * ////////////////////////////////////////////////
   * Save data and meta info
   * ////////////////////////////////////////////////
   */

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

  /**
   * Saves metadata of the data
   * @param {*} nameOrCb 
   * @param {*} cb 
   */
  async saveMeta(nameOrCb, cb) {
    let modelName;
    let callback;

    if (typeof nameOrCb === 'function') {
      modelName = 'model';
      callback = nameOrCb;
    } else if (typeof nameOrCb === 'string') {
      modelName = nameOrCb

      if (typeof cb === 'function') {
        callback = cb
      }

    } else {
      modelName = 'model'
    }

    await saveBlob(JSON.stringify(this.meta), `${modelName}_meta.json`, 'text/plain');
    if (callback) {
      callback();
    }

  }


  /**
   * load a model and metadata
   * @param {*} filesOrPath 
   * @param {*} callback 
   */
  async loadMeta(filesOrPath = null, callback) {

    if (filesOrPath instanceof FileList) {

      const files = await Promise.all(
        Array.from(filesOrPath).map(async (file) => {
          if (file.name.includes('.json') && !file.name.includes('_meta')) {
            return {
              name: "model",
              file
            }
          } else if (file.name.includes('.json') && file.name.includes('_meta.json')) {
            const modelMetadata = await file.text();
            return {
              name: "metadata",
              file: modelMetadata
            }
          } else if (file.name.includes('.bin')) {
            return {
              name: "weights",
              file
            }
          }
          return {
            name: null,
            file: null
          }
        })
      )

      const modelMetadata = JSON.parse(files.find(item => item.name === 'metadata').file);

      this.meta = modelMetadata;

    } else if (filesOrPath instanceof Object) {
      // filesOrPath = {model: URL, metadata: URL, weights: URL}

      let modelMetadata = await fetch(filesOrPath.metadata);
      modelMetadata = await modelMetadata.text();
      modelMetadata = JSON.parse(modelMetadata);

      this.meta = modelMetadata;

    } else {
      const metaPath = `${filesOrPath.substring(0, filesOrPath.lastIndexOf("/"))}/model_meta.json`;
      let modelMetadata = await fetch(metaPath);
      modelMetadata = await modelMetadata.json();

      this.meta = modelMetadata;
    }

    this.isMetadataReady = true;
    this.isWarmedUp = true;

    if (callback) {
      callback();
    }
    return this.meta;
  }



  /*
   * ////////////////////////////////////////////////
   * Helper funcitons
   * ////////////////////////////////////////////////
   */

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


  // /**
  //  * arrayFromLabel
  //  * @param {*} dataRaw 
  //  * @param {*} xsOrYs 
  //  * @param {*} label 
  //  */
  // // eslint-disable-next-line no-unused-vars, class-methods-use-this
  // arrayFromLabel(dataRaw, xsOrYs, label) {
  //   return dataRaw.map(item => item[xsOrYs][label]);
  // }



}

export default NeuralNetworkData;