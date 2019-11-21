// import * as tf from '@tensorflow/tfjs';
// import callCallback from '../utils/callcallback';

import * as tf from '@tensorflow/tfjs';
// import callCallback from '../utils/callcallback';

class NeuralNetworkData {
  constructor(){
    this.config = {
      dataUrl: null,
    }
    this.data = {
      raw: []
    }

  }

  // eslint-disable-next-line class-methods-use-this
  normalizeData(){
    
  }

  // eslint-disable-next-line class-methods-use-this
  async loadCSV(_dataUrl, _inputLabelsArray, _outputLabelsArray){
      const path = _dataUrl;
      const myCsv = tf.data.csv(path);
      const loadedData = await myCsv.toArray();
      const json = {
        entries: loadedData
      }
      this.loadJSON(json, _inputLabelsArray, _outputLabelsArray);
  }

  // eslint-disable-next-line class-methods-use-this
  async loadJSON(_dataUrlOrJson, _inputLabelsArray, _outputLabelsArray){
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
          // convert ys into strings, if the task is classification
          // if (this.config.architecture.task === "classification" && typeof output.ys[prop] !== "string") {
          //   output.ys[prop] += "";
          // }
        }
      })

      return output;
    })
  }

  // eslint-disable-next-line class-methods-use-this
  loadBlob(){

  }

  // eslint-disable-next-line class-methods-use-this
  csvToJSON(){
    
  }

  // eslint-disable-next-line class-methods-use-this
  addData(){
    
  }


  // eslint-disable-next-line class-methods-use-this
  saveData(){

  }

  // eslint-disable-next-line class-methods-use-this
  loadData(){
    
  }




}

export default NeuralNetworkData;