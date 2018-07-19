// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const { featureExtractor } = ml5;

const FEATURE_EXTRACTOR_DEFAULTS = {
  learningRate: 0.0001,
  hiddenUnits: 100,
  epochs: 20,
  numClasses: 2,
  batchSize: 0.4,
};

describe('featureExtractor with Mobilenet', () => {
  let classifier;

  beforeAll(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    classifier = await featureExtractor('MobileNet', {});
  });

  it('Should create a featureExtractor with all the defaults', async () => {
    expect(classifier.learningRate).toBe(FEATURE_EXTRACTOR_DEFAULTS.learningRate);
    expect(classifier.hiddenUnits).toBe(FEATURE_EXTRACTOR_DEFAULTS.hiddenUnits);
    expect(classifier.epochs).toBe(FEATURE_EXTRACTOR_DEFAULTS.epochs);
    expect(classifier.numClasses).toBe(FEATURE_EXTRACTOR_DEFAULTS.numClasses);
    expect(classifier.batchSize).toBe(FEATURE_EXTRACTOR_DEFAULTS.batchSize);
  });

  // describe('predict', () => {
  //   it('Should classify an image of a Robin', async () => {
  //     const img = new Image();
  //     img.crossOrigin = '';
  //     img.src = 'https://ml5js.org/docs/assets/img/bird.jpg';
  //     await new Promise((resolve) => { img.onload = resolve; });
  //     classifier.predict(img)
  //       .then(results => expect(results[0].className).toBe('robin, American robin, Turdus migratorius'));
  //   });
  // });
});
