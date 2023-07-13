import * as tf from '@tensorflow/tfjs';

/**
 * Helper for creating a latent input for generator models DCGAN and CVAE
 */

/**
 * Replace `null` with `1`.
 * @param {tf.SymbolicTensor}layer
 * @return {number[]}
 */
function layerShape(layer) {
  return layer.shape.map(value => value === null ? 1 : value);
}

/**
 * If there are multiple input tensors, look at the specified index only.
 * @param {tf.LayersModel} model
 * @param {number} [layerIndex]
 * @return {number[]}
 */
export function modelInputShape(model, layerIndex = 0) {
  const inputLayer = Array.isArray(model.input) ? model.input[layerIndex] : model.input;
  return layerShape(inputLayer);
}

/**
 * Return all input layer shapes as an array.
 * @param {tf.LayersModel} model
 * @return {number[][]}
 */
export function modelInputShapes(model) {
  const inputLayers = Array.isArray(model.input) ? model.input : [model.input];
  return inputLayers.map(layerShape);
}

/**
 * Create a tensor from an array input or create a random input.
 * @param {tf.LayersModel} model
 * @param {tf.Tensor2D|number[]|Float32Array|undefined} [input]
 * @return {tf.Tensor2D}
 */
export function validateLatentInput(model, input) {
  // handle tensor
  if (input instanceof tf.Tensor) {
    return input;
    // Note: could validate the shape here.
  }
  const shape = modelInputShape(model);
  return tf.tidy(() => {
    // handle no input by returning a random vector
    if (!input) {
      return tf.randomNormal(shape);
    }
    // handle array
    const totalSize = shape.reduce((a, b) => a * b);
    if (totalSize !== input.length) {
      throw new Error(`Length of the latent vector ${input.length} ` +
        `and the input dimensions of the model ${totalSize} must match.`);
    }
    return tf.tensor2d(input, shape, 'float32');
  });
}
