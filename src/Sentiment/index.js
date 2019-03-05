import * as tf from '@tensorflow/tfjs';
import callCallback from '../utils/callcallback';
/**
* Initializes the Sentiment demo.
*/

const OOV_CHAR = 2;
const PAD_CHAR = 0;

function padSequences(sequences, maxLen, padding = 'pre', truncating = 'pre', value = PAD_CHAR) {
  return sequences.map((seq) => {
    // Perform truncation.
    if (seq.length > maxLen) {
      if (truncating === 'pre') {
        seq.splice(0, seq.length - maxLen);
      } else {
        seq.splice(maxLen, seq.length - maxLen);
      }
    }
    // Perform padding.
    if (seq.length < maxLen) {
      const pad = [];
      for (let i = 0; i < maxLen - seq.length; i += 1) {
        pad.push(value);
      }
      if (padding === 'pre') {
        // eslint-disable-next-line no-param-reassign
        seq = pad.concat(seq);
      } else {
        // eslint-disable-next-line no-param-reassign
        seq = seq.concat(pad);
      }
    }
    return seq;
  });
}

class Sentiment {
  constructor(callback) {
    // console.log('constructor');
    this.ready = callCallback(this.init(), callback);
  }
  /**
  * Initializes the Sentiment demo.
  */
  async init() {
    const HOSTED_URLS = {
      model:
        'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json',
      metadata:
        'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json',
    };

    this.model = await tf.loadModel(HOSTED_URLS.model);
    const metadataJson = await fetch(HOSTED_URLS.metadata);
    const sentimentMetadata = await metadataJson.json();

    this.indexFrom = sentimentMetadata.index_from;
    this.maxLen = sentimentMetadata.max_len;

    this.wordIndex = sentimentMetadata.word_index;
    this.vocabularySize = sentimentMetadata.vocabulary_size;
  }

  predict(text) {
    // Convert to lower case and remove all punctuations.
    const inputText =
      text.trim().toLowerCase().replace(/[.,?!]/g, '').split(' ');
    // Convert the words to a sequence of word indices.

    const sequence = inputText.map((word) => {
      let wordIndex = this.wordIndex[word] + this.indexFrom;
      if (wordIndex > this.vocabularySize) {
        wordIndex = OOV_CHAR;
      }
      return wordIndex;
    });

    // Perform truncation and padding.
    const paddedSequence = padSequences([sequence], this.maxLen);
    const input = tf.tensor2d(paddedSequence, [1, this.maxLen]);
    const beginMs = performance.now();
    const predictOut = this.model.predict(input);
    const score = predictOut.dataSync()[0];
    predictOut.dispose();
    const endMs = performance.now();

    return { score, elapsed: (endMs - beginMs) };
  }
}

const sentiment = callback => new Sentiment(callback);

export default sentiment;

