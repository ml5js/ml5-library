import * as tf from '@tensorflow/tfjs';
import axios from 'axios';
import * as io from '../utils/io';
import loadData from './loadData';
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
    };

    this.isMetadataReady = false;
    this.isWarmedUp = false;

    this.data = {
      raw: [], // array of {xs:{}, ys:{}}
    };

    // methods
    // summarize data
    this.createMetadata = this.createMetadata.bind(this);
    this.setDataStats = this.setDataStats.bind(this);
    this.getInputMetaStats = this.getInputMetaStats.bind(this);
    this.setDataUnits = this.setDataUnits.bind(this);
    this.setInputMetaUnits = this.setInputMetaUnits.bind(this);
    this.setDTypesFromData = this.setDTypesFromData.bind(this);
    // add data
    this.addData = this.addData.bind(this);
    // data conversion
    this.convertRawToTensors = this.convertRawToTensors.bind(this);
    // data normalization / unnormalization
    this.normalizeDataRaw = this.normalizeDataRaw.bind(this);
    this.normalizeInputData = this.normalizeInputData.bind(this);
    this.normalizeArray = this.normalizeArray.bind(this);
    this.unnormalizeArray = this.unnormalizeArray.bind(this);
    // one hot
    this.applyOneHotEncodingsToDataRaw = this.applyOneHotEncodingsToDataRaw.bind(this);
    this.setDataOneHot = this.setDataOneHot.bind(this);
    this.getInputMetaOneHot = this.getInputMetaOneHot.bind(this);
    this.createOneHotEncodings = this.createOneHotEncodings.bind(this);
    // Saving / loading data
    this.loadData = this.loadData.bind(this);
    this.saveData = this.saveData.bind(this);
    this.saveMeta = this.saveMeta.bind(this);
    this.loadMeta = this.loadMeta.bind(this);
    // data loading helpers
    this.formatRawData = this.formatRawData.bind(this);
  }

  /**
   * ////////////////////////////////////////////////////////
   * Summarize Data
   * ////////////////////////////////////////////////////////
   */

  /**
   * create the metadata from the data
   * this covers:
   *  1. getting the datatype from the data
   *  2. getting the min and max from the data
   *  3. getting the oneHot encoded values
   *  4. getting the inputShape and outputUnits from the data
   * @param {number[]} [inputShape]
   */
  createMetadata(inputShape = null) {
    if (!this.data.raw.length) {
      throw new Error('Cannot create metadata because no data has been added.');
    }
    // get the data type for each property
    this.setDTypesFromData();
    // get the stats - min, max
    this.setDataStats();
    // onehot encode
    this.setDataOneHot();
    // calculate the input units from the data
    this.setDataUnits(inputShape);

    this.isMetadataReady = true;
  }

  /*
   * ////////////////////////////////////////////////
   * data Summary
   * ////////////////////////////////////////////////
   */

  /**
   * @private
   * get stats about the data
   */
  setDataStats() {
    // TODO: I don't like that this overwrites the existing value -Linda
    this.meta.inputs = this.getInputMetaStats(this.meta.inputs, 'xs');
    this.meta.outputs = this.getInputMetaStats(this.meta.outputs, 'ys');
  }

  /**
   * @private
   * getRawStats
   * get back the min and max of each label
   * @param {*} inputOrOutputMeta
   * @param {*} xsOrYs
   */
  getInputMetaStats(inputOrOutputMeta, xsOrYs) {
    const inputMeta = Object.assign({}, inputOrOutputMeta);

    Object.keys(inputMeta).forEach(k => {
      if (inputMeta[k].dtype === 'string') {
        inputMeta[k].min = 0;
        inputMeta[k].max = 1;
      } else if (inputMeta[k].dtype === 'number') {
        const dataAsArray = this.data.raw.map(item => item[xsOrYs][k]);
        inputMeta[k].min = nnUtils.getMin(dataAsArray);
        inputMeta[k].max = nnUtils.getMax(dataAsArray);
      } else if (inputMeta[k].dtype === 'array') {
        const dataAsArray = this.data.raw.map(item => item[xsOrYs][k]).flat();
        inputMeta[k].min = nnUtils.getMin(dataAsArray);
        inputMeta[k].max = nnUtils.getMax(dataAsArray);
      }
    });

    return inputMeta;
  }

  /**
   * @private
   * get the data units, inputshape and output units
   * @param {*} arrayShape
   */
  setDataUnits(arrayShape) {
    // if the data has a shape pass it in
    this.meta.inputUnits = arrayShape ?? [this.setInputMetaUnits(this.meta.inputs)].flat();
    this.meta.outputUnits = this.setInputMetaUnits(this.meta.outputs);
  }

  /**
   * @private
   * get input
   * @param {*} _inputsMeta
   */
  // eslint-disable-next-line class-methods-use-this
  setInputMetaUnits(_inputsMeta) {
    let units = 0;
    const inputsMeta = Object.assign({}, _inputsMeta);

    Object.entries(inputsMeta).forEach(arr => {
      const { dtype } = arr[1];
      if (dtype === 'number') {
        units += 1;
      } else if (dtype === 'string') {
        const { uniqueValues } = arr[1];

        const uniqueCount = uniqueValues.length;
        units += uniqueCount;
      } else if (dtype === 'array') {
        // TODO: User must input the shape of the
        // image size correctly.
        units = [];
      }
    });

    return units;
  }

  /**
   * @private
   * setDTypesFromData
   * gets the data types of the data we're using
   * important for handling oneHot
   */
  setDTypesFromData() {
    const meta = {
      ...this.meta,
      inputs: {},
      outputs: {},
    };

    const sample = this.data.raw[0];
    const xs = Object.keys(sample.xs);
    const ys = Object.keys(sample.ys);

    xs.forEach(prop => {
      meta.inputs[prop] = {
        dtype: nnUtils.getDataType(sample.xs[prop]),
      };
    });

    ys.forEach(prop => {
      meta.outputs[prop] = {
        dtype: nnUtils.getDataType(sample.ys[prop]),
      };
    });

    // TODO: check if all entries have the same dtype.
    // otherwise throw an error

    this.meta = meta;
  }

  /**
   * ////////////////////////////////////////////////////////
   * Add Data
   * ////////////////////////////////////////////////////////
   */

  /**
   * @public - used by nn
   * Add Data
   * @param {object} xInputObj, {key: value}, key must be the name of the property value must be a String, Number, or Array
   * @param {*} yInputObj, {key: value}, key must be the name of the property value must be a String, Number, or Array
   */
  addData(xInputObj, yInputObj) {
    this.data.raw.push({
      xs: xInputObj,
      ys: yInputObj,
    });
  }

  /**
   * ////////////////////////////////////////////////////////
   * Tensor handling
   * ////////////////////////////////////////////////////////
   */

  /**
   * @public - used by nn
   * convertRawToTensors
   * converts array of {xs, ys} to tensors
   * @param {*} _dataRaw
   * @param {*} meta
   * TODO: requires the nn to pass in the training data as an argument -- why?
   */
  convertRawToTensors(dataRaw) {
    const meta = Object.assign({}, this.meta);
    const dataLength = dataRaw.length;

    return tf.tidy(() => {
      const inputArr = [];
      const outputArr = [];

      dataRaw.forEach(row => {
        // get xs
        const xs = Object.keys(meta.inputs)
          .map(k => {
            return row.xs[k];
          })
          .flat();

        inputArr.push(xs);

        // get ys
        const ys = Object.keys(meta.outputs)
          .map(k => {
            return row.ys[k];
          })
          .flat();

        outputArr.push(ys);
      });

      const inputs = tf.tensor(inputArr.flat(), [dataLength, ...meta.inputUnits]);
      const outputs = tf.tensor(outputArr.flat(), [dataLength, meta.outputUnits]);

      return {
        inputs,
        outputs,
      };
    });
  }

  /**
   * ////////////////////////////////////////////////////////
   * data normalization / unnormalization
   * ////////////////////////////////////////////////////////
   */

  /**
   * @public - used by nn
   * normalize the dataRaw input
   */
  normalizeDataRaw() {
    const normXs = this.normalizeInputData(this.meta.inputs, 'xs');
    const normYs = this.normalizeInputData(this.meta.outputs, 'ys');

    return nnUtils.zipArrays(normXs, normYs);
  }

  /**
   * @private
   * @param {*} inputOrOutputMeta
   * @param {*} xsOrYs
   */
  normalizeInputData(inputOrOutputMeta, xsOrYs) {
    // the data length
    const dataLength = this.data.raw.length;
    // the copy of the inputs.meta[inputOrOutput]
    const inputMeta = Object.assign({}, inputOrOutputMeta);

    // normalized output object
    const normalized = {};
    Object.keys(inputMeta).forEach(k => {
      // get the min and max values
      const options = {
        min: inputMeta[k].min,
        max: inputMeta[k].max,
      };

      const dataAsArray = this.data.raw.map(item => item[xsOrYs][k]);
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
        [xsOrYs]: {},
      };

      Object.keys(inputMeta).forEach(k => {
        row[xsOrYs][k] = normalized[k][idx];
      });

      return row;
    });

    return output;
  }

  /**
   * @public - used by nn
   * @param {*} _input
   * @param {*} _options
   */
  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  normalizeArray(inputArray, options) {
    const { min, max } = options;

    // if the data are onehot encoded, replace the string
    // value with the onehot array
    // if none exists, return the given value
    if (options.legend) {
      const normalized = inputArray.map(v => {
        return options.legend[v] ? options.legend[v] : v;
      });
      return normalized;
    }

    // if the dtype is a number
    if (inputArray.every(v => typeof v === 'number')) {
      const normalized = inputArray.map(v => nnUtils.normalizeValue(v, min, max));
      return normalized;
    }

    // otherwise return the input array
    // return inputArray;
    throw new Error('error in inputArray of normalizeArray() function');
  }

  /**
   * @public but not used anywhere
   * @param {*} _input
   * @param {*} _options
   */
  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  unnormalizeArray(inputArray, options) {
    const { min, max } = options;

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
        });
        return res;
      });

      return unnormalized;
    }

    // if the dtype is a number
    if (inputArray.every(v => typeof v === 'number')) {
      const unnormalized = inputArray.map(v => nnUtils.unnormalizeValue(v, min, max));
      return unnormalized;
    }

    // otherwise return the input array
    // return inputArray;
    throw new Error('error in inputArray of normalizeArray() function');
  }

  /*
   * ////////////////////////////////////////////////
   * One hot encoding handling
   * ////////////////////////////////////////////////
   */

  /**
   * @public - used by nn
   * applyOneHotEncodingsToDataRaw
   * does not set this.data.raws
   * but rather returns them
   * @param {*} _dataRaw
   * @param {*} _meta
   */
  applyOneHotEncodingsToDataRaw() {
    const meta = Object.assign({}, this.meta);

    const output = this.data.raw.map(row => {
      const xs = {
        ...row.xs,
      };
      const ys = {
        ...row.ys,
      };
      // get xs
      Object.keys(meta.inputs).forEach(k => {
        if (meta.inputs[k].legend) {
          xs[k] = meta.inputs[k].legend[row.xs[k]];
        }
      });

      Object.keys(meta.outputs).forEach(k => {
        if (meta.outputs[k].legend) {
          ys[k] = meta.outputs[k].legend[row.ys[k]];
        }
      });

      return {
        xs,
        ys,
      };
    });

    return output;
  }

  /**
   * @private
   * creates onehot encodings for the input and outputs
   * and adds them to the meta info
   */
  setDataOneHot() {
    this.meta.inputs = this.getInputMetaOneHot(this.meta.inputs, 'xs');
    this.meta.outputs = this.getInputMetaOneHot(this.meta.outputs, 'ys');
  }

  /**
   * @private
   * @param {*} _inputsMeta
   * @param {*} xsOrYs
   */
  getInputMetaOneHot(_inputsMeta, xsOrYs) {
    const inputsMeta = Object.assign({}, _inputsMeta);

    Object.entries(inputsMeta).forEach(arr => {
      // the key
      const key = arr[0];
      // the value
      const { dtype } = arr[1];

      if (dtype === 'string') {
        const uniqueVals = [...new Set(this.data.raw.map(obj => obj[xsOrYs][key]))];
        const oneHotMeta = this.createOneHotEncodings(uniqueVals);
        inputsMeta[key] = {
          ...inputsMeta[key],
          ...oneHotMeta,
        };
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
        legend: {},
      };

      const uniqueVals = _uniqueValuesArray; // [...new Set(this.data.raw.map(obj => obj.xs[prop]))]
      // get back values from 0 to the length of the uniqueVals array
      const onehotValues = uniqueVals.map((item, idx) => idx);
      // oneHot encode the values in the 1d tensor
      const oneHotEncodedValues = tf.oneHot(tf.tensor1d(onehotValues, 'int32'), uniqueVals.length);
      // convert them from tensors back out to an array
      const oneHotEncodedValuesArray = oneHotEncodedValues.arraySync();

      // populate the legend with the key/values
      uniqueVals.forEach((uVal, uIdx) => {
        output.legend[uVal] = oneHotEncodedValuesArray[uIdx];
      });

      return output;
    });
  }

  /**
   * ////////////////////////////////////////////////
   * saving / loading data
   * ////////////////////////////////////////////////
   */

  /**
   * loadData from fileinput or path
   *
   * TODO: formatting requires the labels, but this is not always provided.
   *
   * @param {string | FileList} filesOrPath
   * @param {string[]} inputLabels
   * @param {string[]} outputLabels
   * @return {Promise<void>}
   */
  async loadData(filesOrPath, inputLabels, outputLabels) {
    const dataArray = await loadData(filesOrPath);
    this.formatRawData(dataArray, inputLabels, outputLabels);
  }

  /**
   * saveData
   * @param {string} [name]
   * @return {Promise<void>}
   */
  async saveData(name) {
    const today = new Date();
    const date = `${String(today.getFullYear())}-${String(today.getMonth() + 1)}-${String(
      today.getDate(),
    )}`;
    const time = `${String(today.getHours())}-${String(today.getMinutes())}-${String(
      today.getSeconds(),
    )}`;
    const datetime = `${date}_${time}`;

    let dataName = datetime;
    if (name) dataName = name;

    const output = {
      data: this.data.raw,
    };

    await io.saveJSON(output, dataName);
  }

  /**
   * Saves metadata of the data
   * @param {string} name
   * @return {Promise<void>}
   */
  async saveMeta(name) {
    await io.saveJSON(this.meta, `${name}_meta`);
  }

  /**
   * load a model and metadata
   * @param {string | FileList} filesOrPath
   * @return {Promise<void>}
   */
  async loadMeta(filesOrPath) {
    if (filesOrPath instanceof FileList) {
      const files = await Promise.all(
        Array.from(filesOrPath).map(async file => {
          if (file.name.includes('.json') && !file.name.includes('_meta')) {
            return {
              name: 'model',
              file,
            };
          } else if (file.name.includes('.json') && file.name.includes('_meta.json')) {
            const modelMetadata = await file.text();
            return {
              name: 'metadata',
              file: modelMetadata,
            };
          } else if (file.name.includes('.bin')) {
            return {
              name: 'weights',
              file,
            };
          }
          return {
            name: null,
            file: null,
          };
        }),
      );

      const modelMetadata = JSON.parse(files.find(item => item.name === 'metadata').file);

      this.meta = modelMetadata;
    } else if (filesOrPath instanceof Object) {
      // filesOrPath = {model: URL, metadata: URL, weights: URL}

      let modelMetadata = await axios.get(filesOrPath.metadata, {responseType:"text"});
      modelMetadata = JSON.stringify(modelMetadata.data);
      modelMetadata = JSON.parse(modelMetadata);

      this.meta = modelMetadata;
    } else {
      const metaPath = `${filesOrPath.substring(0, filesOrPath.lastIndexOf('/'))}/model_meta.json`;
      let modelMetadata = await axios.get(metaPath);
      modelMetadata = modelMetadata.data;

      this.meta = modelMetadata;
    }

    this.isMetadataReady = true;
    this.isWarmedUp = true;
  }

  /*
   * ////////////////////////////////////////////////
   * data loading helpers
   * ////////////////////////////////////////////////
   */

  /**
   * // TODO: convert ys into strings, if the task is classification
    // if (this.config.architecture.task === "classification" && typeof output.ys[prop] !== "string") {
    //   output.ys[prop] += "";
    // }
   * formatRawData
   * takes a json and set the this.data.raw
   * @param {RawPropertyData[][]} dataArray
   * @param {string[]} inputLabels
   * @param {string[]} outputLabels
   */
  formatRawData(dataArray, inputLabels, outputLabels) {
    if (!dataArray.length > 0) {
      console.log(`your data must be contained in an array in \n
        a property called 'entries' or 'data' of your json object`);
    }

    // create an array of json objects [{xs,ys}]
    // set this.data.raw
    this.data.raw = dataArray.map((item, idx) => {
      const output = {
        xs: {},
        ys: {},
      };

      inputLabels.forEach(k => {
        if (item[k] !== undefined) {
          output.xs[k] = item[k];
        } else {
          console.error(`the input label ${k} does not exist at row ${idx}`);
        }
      });

      outputLabels.forEach(k => {
        if (item[k] !== undefined) {
          output.ys[k] = item[k];
        } else {
          console.error(`the output label ${k} does not exist at row ${idx}`);
        }
      });

      return output;
    });
  }
  
  /**
   * getData
   * return data object's raw array
   * to make getting raw data easier
   */
  getData() {
    const rawArray = this.data.raw;
    return rawArray;
  }
}

export default NeuralNetworkData;
