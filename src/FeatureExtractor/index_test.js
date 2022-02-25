// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import featureExtractor from './index';

const FEATURE_EXTRACTOR_DEFAULTS = {
  learningRate: 0.0001,
  hiddenUnits: 100,
  epochs: 20,
  numLabels: 2,
  batchSize: 0.4,
};

describe('featureExtractor with Mobilenet', () => {
  let classifier;

  beforeAll(async () => {
    jest.setTimeout(10000);
    classifier = await featureExtractor('MobileNet', {});
  });

  it('Should create a featureExtractor with all the defaults', async () => {
    expect(classifier.config.learningRate).toBe(FEATURE_EXTRACTOR_DEFAULTS.learningRate);
    expect(classifier.config.hiddenUnits).toBe(FEATURE_EXTRACTOR_DEFAULTS.hiddenUnits);
    expect(classifier.config.epochs).toBe(FEATURE_EXTRACTOR_DEFAULTS.epochs);
    expect(classifier.config.numLabels).toBe(FEATURE_EXTRACTOR_DEFAULTS.numLabels);
    expect(classifier.config.batchSize).toBe(FEATURE_EXTRACTOR_DEFAULTS.batchSize);
  });

  // TODO: test featureExtractor methods -- needs an image with known/expected outputs.
});
