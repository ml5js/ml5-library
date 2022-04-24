import * as tf from '@tensorflow/tfjs';
import axios from 'axios';

/**
 * Wrapper around a tf.LayersModel used for image classification.
 */

class CustomImageClassifier {

  /**
   * @param {string} url
   */
  constructor(url) {
    // its a url, we expect to find model.json
    // The teachablemachine urls end with a slash, so add model.json to complete the full path
    /**
     * @type {string}
     */
    this.url = url.endsWith('/') ? `${url}model.json` : url;
    /**
     * @type {string[]}
     */
    this.labels = [];
    /**
     * @type {tf.LayersModel | null}
     */
    this.model = null;
  }

  /**
   * @private
   * Attempt to load labels from a property `ml5Specs` in the `model.json`
   * or from a `metadata.json` file in the same directory.
   * If no labels can be found, the model will treat the indices as labels.
   * @return {Promise<void>}
   */
  async loadLabels() {
    // first try from the model.json
    try {
      const result = await axios.get(this.url);
      // eslint-disable-next-line prefer-destructuring
      const data = result.data;

      if (data.ml5Specs) {
        this.labels = data.ml5Specs.mapStringToIndex;
        return;
      }
    } catch (error) {
      console.warn("Error loading model json file.", error);
    }
    // then try from the metadata.json
    try {
      const prefix = this.url.slice(0, this.url.lastIndexOf("/"));
      const metadataUrl = `${prefix}/metadata.json`;

      const result = await axios.get(metadataUrl);
      // eslint-disable-next-line prefer-destructuring
      const data = result.data;
      if (!data.labels) {
        console.warn(`metadata.json file does not contain property 'labels'.`);
      }
      this.labels = data.labels;
    } catch (error) {
      console.warn("Tried to fetch metadata.json, but it seems to be missing.", error);
    }
  }

  /**
   * @private
   * Load the TensorFlow model from the URL.
   * @return {Promise<void>}
   */
  async loadModel() {
    try {
      this.model = await tf.loadLayersModel(this.url);
    } catch (error) {
      throw new Error(`Error loading model: ${error}`);
    }
  }

  /**
   * @public
   * Load the model and the labels in parallel.
   * @return {Promise<void>}
   */
  async load() {
    await Promise.all([
      this.loadLabels(),
      this.loadModel()
    ])
  }

  /**
   * @param {tf.Tensor3D} img
   * @param {number} topk
   * @return {Promise<{probability: number, className: number|string}[]>}
   */
  async classify(img, topk) {
    const predictedClasses = tf.tidy(() => {
      return this.model.predict(img).as1D();
    });
    // TODO: combine with getTopKClassesFromTensor in other models.
    const data = await predictedClasses.data();
    return Array.from(data)
      .map((probability, index) => {
        const className =
          this.labels.length > 0 && this.labels[index]
            ? this.labels[index]
            : index;
        return {
          className,
          probability,
        };
      })
      .sort((a, b) => b.probability - a.probability)
      .slice(0, topk);
  }
}

/**
 * @param {string} url
 * @return {Promise<CustomImageClassifier>}
 */
// eslint-disable-next-line import/prefer-default-export
export async function load(url) {
  const model = new CustomImageClassifier(url);
  await model.load();
  return model;
}
