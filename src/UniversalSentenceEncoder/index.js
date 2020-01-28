// import * as tf from '@tensorflow/tfjs';
// import callCallback from '../utils/callcallback';
import * as USE from '@tensorflow-models/universal-sentence-encoder';

class UniversalSentenceEncoder {
  constructor(){
    this.model = null;
    this.config = {};
  }

  /**
   * load model
   */
  async loadModel(){
    this.model = await USE.load();
    return this;
  }

  

}

const universalSentenceEncoder = (optionsOr, cb) => {
  let options = {};
  let callback = cb;

  if (typeof optionsOr === 'function') {
    callback = optionsOr;
  } else if (typeof optionsOr === 'object') {
    options = optionsOr;
  }

  if (typeof optionsOr === 'object') {
    options = optionsOr;
  } else if (typeof optionsOr === 'function') {
    callback = optionsOr;
  }
  return new UniversalSentenceEncoder(options, callback);
};

export default universalSentenceEncoder;