import * as tf from '@tensorflow/tfjs';
import p5Utils from './p5Utils';

/**
* @typedef {Object} GeneratedImageResult
* @property {Uint8ClampedArray} raw - an array of all pixel values
* @property {Blob} blob - image blob
* @property {p5.Image | null} image - p5 Image, if p5 is available.
* @property {tf.Tensor3D} [tensor] - the original tensor, if `returnTensors` is true.
*/

/**
 * Utility function for returning an image in multiple formats.
 *
 * Takes a Tensor and returns an object containing `blob`, `raw`, `image`, and optionally `tensor`.
 * Will dispose of the Tensor if not returning it.
 *
 * Accepts options as an object with property `returnTensors` so that models can pass this.config.
 *
 * @param {tf.Tensor3D} tensor
 * @param {{ returnTensors: boolean }} options
 * @return {Promise<GeneratedImageResult>}
 */
export default async function generatedImageResult(tensor, options) {
  const raw = await tf.browser.toPixels(tensor); // or tensor.data()??
  const [height, width] = tensor.shape;
  const blob = await p5Utils.rawToBlob(raw, width, height);
  const image = await p5Utils.blobToP5Image(blob);
  if (options.returnTensors) {
    return { tensor, raw, blob, image };
  }
  tensor.dispose();
  return { raw, blob, image };
}
