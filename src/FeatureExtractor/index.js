// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
General Feature Extractor Manager
*/

import Mobilenet from './Mobilenet';

/* eslint max-len: ["error", { "code": 180 }] */
const featureExtractor = (model, optionsOrCallback, cb = () => {}) => {
  let modelName;
  if (typeof model !== 'string') {
    throw new Error('Please specify a model to use. E.g: "MobileNet"');
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
  throw new Error(`${modelName} is not a valid model.`);
};

export default featureExtractor;
