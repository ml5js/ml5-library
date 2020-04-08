// import * as tf from '@tensorflow/tfjs';
import * as USE from '@tensorflow-models/universal-sentence-encoder';
import callCallback from '../utils/callcallback';

const DEFAULTS = {
  withTokenizer: false,
}

class UniversalSentenceEncoder {
  constructor(options, callback){
    this.model = null;
    this.tokenizer = null;
    this.config = {
      withTokenizer: options.withTokenizer || DEFAULTS.withTokenizer
    };

    callCallback(this.loadModel(), callback);
  }

  /**
   * load model
   */
  async loadModel(){
    if(this.config.withTokenizer === true){
      this.tokenizer = await USE.loadTokenizer();
    } 
    this.model = await USE.load();
    return this;
  }

  /**
   * Encodes a string or array based on the USE
   * @param {*} textString 
   * @param {*} callback 
   */
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
      console.error(err);
      return err;
    }
  }

  /**
   * Encodes a string based on the loaded tokenizer if the withTokenizer:true
   * @param {*} textString 
   * @param {*} callback 
   */
  encode(textString, callback){
    return callCallback(this.encodeInternal(textString), callback);
  }

  async encodeInternal(textString){
    if(this.config.withTokenizer === true){
      return this.tokenizer.encode(textString);
    } 
    console.error('withTokenizer must be set to true - please pass "withTokenizer:true" as an option in the constructor');
    return false;
  }

}

const universalSentenceEncoder = (optionsOr, cb) => {
  const options = (typeof optionsOr === 'object') ? optionsOr : {};
  const callback = (typeof optionsOr === 'function') ? optionsOr : cb;

  return new UniversalSentenceEncoder(options, callback);
};

export default universalSentenceEncoder;