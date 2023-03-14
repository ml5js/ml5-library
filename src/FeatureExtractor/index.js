// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
General Feature Extractor Manager
*/

import handleArguments from "../utils/handleArguments";
import Mobilenet from './Mobilenet';

/**
 * @typedef {Object} options
 * @property {number} version - default 1
 * @property {number} alpha - default 1.0
 * @property {number} topk - default 3
 * @property {number} learningRate - default 0.0001
 * @property {number} hiddenUnits - default 100
 * @property {number} epochs - default 20
 * @property {number} numClasses - default 2
 * @property {number} batchSize - default 0.4
 */


/**
 * Create a featureExtractor.
 * @param {model} model - The model from which extract the learned features. Case-insensitive
 * @param {options || function} optionsOrCallback - Optional.
 * @param {function} cb - Optional. 
 */
const featureExtractor = (model, optionsOrCallback, cb) => {
  const { string: modelName, options = {}, callback } = handleArguments(model, optionsOrCallback, cb);

  // Default to using MobileNet if no model is provided.

  if ( modelName && modelName.toLowerCase() !== 'mobilenet') {
    throw new Error(`${modelName} is not a valid model.`);
  }

  return new Mobilenet(options, callback);
};

export default featureExtractor;
