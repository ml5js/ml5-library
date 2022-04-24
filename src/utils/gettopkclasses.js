// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import * as tf from "@tensorflow/tfjs-core";

/**
 * @param {tf.Tensor | tf.TensorLike} logits - Tensor or array with the predicted probabilities for each class.
 * @param {number} topK - Number of results to return.
 * @param {string[]} [classes] - Array which maps indices to class names. If no classes are provided, the index
 * will be used as the label. It will be cast to a string for consistency.
 * @param {boolean} [keepTensor] - The logits will be automatically disposed unless this is `true`.
 * @return {Promise<Array<{ label: string, confidence: number}>>} - An array of objects with properties `label` and `confidence`.
 */
export default async function getTopKClasses(logits, topK, classes, keepTensor= false ) {
  const top = tf.topk(logits, topK, true);
  const values = await top.values.data();
  const indices = await top.indices.data();
  const result = Array.from(indices).map((index, i) => ({
    confidence: values[i],
    label: classes ? classes[index] : index.toString(10)
  }))
  top.values.dispose();
  top.indices.dispose();
  if (!keepTensor && logits instanceof tf.Tensor) {
    logits.dispose();
  }
  return result;
}
