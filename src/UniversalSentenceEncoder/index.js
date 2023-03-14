import * as USE from '@tensorflow-models/universal-sentence-encoder';
import callCallback from '../utils/callcallback';
import handleArguments from '../utils/handleArguments';

const DEFAULTS = {
  withTokenizer: false,
}

class UniversalSentenceEncoder {
  constructor(options, callback) {
    /**
     * @type {null | USE.UniversalSentenceEncoder}
     */
    this.model = null;
    this.config = {
      // TODO: accept options modelUrl, vocabUrl, returnTensors
      withTokenizer: options.withTokenizer || DEFAULTS.withTokenizer
    };
    this.ready = callCallback(this.loadModel(), callback);
  }

  /**
   * load model
   */
  async loadModel() {
    // Note: can load tokenizer without loading model, but model will always load a tokenizer.
    this.model = await USE.load();
    return this;
  }

  /**
   * Encodes a string or array based on the USE
   * @param {string | string[]} text
   * @param {ML5Callback<number[][]>} [callback]
   * @return {Promise<number[][]>}
   */
  predict(text, callback) {
    return callCallback(this.predictInternal(text), callback);
  }

  async predictInternal(textArray) {
    await this.ready;
    const embeddings = await this.model.embed(textArray);
    const results = await embeddings.array();
    embeddings.dispose();
    return results;
  }

  /**
   * Encodes a string based on the loaded tokenizer if the withTokenizer:true
   * @param {string} textString
   * @param {ML5Callback<number[]>} [callback]
   * @return {Promise<number[]>}
   */
  encode(textString, callback) {
    return callCallback(this.encodeInternal(textString), callback);
  }

  async encodeInternal(textString) {
    await this.ready;
    return this.model.tokenizer.encode(textString);
  }

}

const universalSentenceEncoder = (optionsOr, cb) => {
  const { options = {}, callback } = handleArguments(optionsOr, cb);
  const instance = new UniversalSentenceEncoder(options, callback);
  return callback ? instance : instance.ready;
};

export default universalSentenceEncoder;
