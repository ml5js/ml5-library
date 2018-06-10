// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
General Feature Extractor Manager
*/

import Mobilenet from './Mobilenet';

/* eslint max-len: ["error", { "code": 180 }] */
const FeatureExtractor = (model, optionsOrCallback, cb = () => {}) => {
  let modelName;
  if (typeof model !== 'string') {
    console.error('Please specify a model to use. E.g: "Mobilenet"');
  } else {
    modelName = model.toLowerCase();
  }

  let options = {};
  let callback = cb;

  if (optionsOrCallback === 'object') {
    options = optionsOrCallback;
  } else if (typeof optionsOrCallback === 'function') {
    callback = optionsOrCallback;
  }

  if (modelName === 'mobilenet') {
    return new Mobilenet(options, callback);
  }
  console.error(`${modelName} is not a valid model.`);
  return null;
};

export default FeatureExtractor;
