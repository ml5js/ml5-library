// import * as tf from '@tensorflow/tfjs';
// import callCallback from '../utils/callcallback';

import * as tf from '@tensorflow/tfjs';
// import callCallback from '../utils/callcallback';

class NeuralNetworkData {
  constructor() {
    this.config = {
      dataUrl: null,
    }
    this.data = {
      raw: []
    }

  }


  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  normalizeData(_input) {

  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  oneHotEncode(_input) {

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
        if(item[k] !== undefined){
          output.xs[k] = item[k];
        } else {
          console.error(`the input label ${k} does not exist at row ${idx}`)
        }
      })

      outputLabels.forEach(k => {
        if(item[k] !== undefined){
          output.ys[k] = item[k];
          // TODO: convert ys into strings, if the task is classification
          // if (this.config.architecture.task === "classification" && typeof output.ys[prop] !== "string") {
          //   output.ys[prop] += "";
          // }
        }else {
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
    const {inputLabels, outputLabels} = options;

    function formatIncomingData(incoming, labels){
      let result = {};
      if (Array.isArray(incoming)) {
        incoming.forEach((item, idx) => {
          const label = labels[idx];
          result[label] = item;
        });
        return result;
      } else if (typeof xInputs === 'object') {
        result = xInputs;
        return result;
      } 

      throw new Error('input provided is not supported or does not match your output label specifications')
    }

    const inputs = formatIncomingData(xInputs, inputLabels);
    const outputs = formatIncomingData(yInputs, outputLabels);

    this.data.raw.push({
      xs: inputs,
      ys: outputs
    });
  }


  // eslint-disable-next-line class-methods-use-this
  saveData() {

  }

  // eslint-disable-next-line class-methods-use-this
  loadData() {

  }

  /*
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


  


}

export default NeuralNetworkData;