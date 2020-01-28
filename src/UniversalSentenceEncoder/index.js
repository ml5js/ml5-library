// import * as tf from '@tensorflow/tfjs';
import * as USE from '@tensorflow-models/universal-sentence-encoder';
import callCallback from '../utils/callcallback';

class UniversalSentenceEncoder {
  constructor(options, callback){
    this.model = null;
    this.config = {};

    callCallback(this.loadModel(),callback);
  }

  /**
   * load model
   */
  async loadModel(){
    this.model = await USE.load();
    return this;
  }

  predict(textArray, callback){
    return callCallback(this.predictInternal(textArray), callback);
  }

  async predictInternal(textArray){
    try{
      const embeddings = await this.model.embed(textArray);
      const results = await embeddings.array();
      embeddings.dispose();
      return results;
    } catch(err){
      throw new Error(err);
    }
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