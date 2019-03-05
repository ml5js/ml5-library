class Sentiment {
    constructor() {}
  
    async init() {
      const urls = {
        model: 'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json',
        metadata: 'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json'
      };

      this.model = await loadHostedPretrainedModel(urls.model);
      const sentimentMetadata = await loadHostedMetadata(urls.metadata);
      this.indexFrom = sentimentMetadata['index_from'];
      this.maxLen = sentimentMetadata['max_len'];
      this.wordIndex = sentimentMetadata['word_index'];
      return 'model loaded';
    }
  
    predict(text) {
      // Convert to lower case and remove all punctuations.
      const inputText = text
        .trim()
        .toLowerCase()
        .replace(/(\.|\,|\!)/g, '')
        .split(' ');

      // Look up word indices.
      const inputBuffer = tf.buffer([1, this.maxLen], 'float32');
      for (let i = 0; i < inputText.length; ++i) {
        // TODO(cais): Deal with OOV words.
        const word = inputText[i];
        inputBuffer.set(this.wordIndex[word] + this.indexFrom, 0, i);
      }
      
      const input = inputBuffer.toTensor();
  
      console.log('Running inference');
      const predictOut = this.model.predict(input);
      const score = predictOut.dataSync()[0];
      predictOut.dispose();
  
      return { score: score };
    }
  }
  

  /**
   * Load pretrained model stored at a remote URL.
   *
   * @return An instance of `tf.Model` with model topology and weights loaded.
   */
  async function loadHostedPretrainedModel(url) {
    console.log('Loading pretrained model from ' + url);
    try {
      const model = await tf.loadModel(url);
      console.log('Done loading pretrained model.');
      return model;
    } catch (err) {
      console.error(err);
      console.log('Loading pretrained model failed.');
    }
  }
  
  /**
   * Load metadata file stored at a remote URL.
   *
   * @return An object containing metadata as key-value pairs.
   */
  async function loadHostedMetadata(url) {
    console.log('Loading metadata from ' + url);
    try {
      const metadataJson = await fetch(url);
      const metadata = await metadataJson.json();
      console.log('Done loading metadata.');
      return metadata;
    } catch (err) {
      console.error(err);
      console.log('Loading metadata failed.');
    }
  }