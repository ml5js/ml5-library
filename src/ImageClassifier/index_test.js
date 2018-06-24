/* eslint new-cap: 0 */

import * as ImageClassifier from './index';

const DEFAULTS = {
  learningRate: 0.0001,
  hiddenUnits: 100,
  epochs: 20,
  numClasses: 2,
  batchSize: 0.4,
};

describe('Create an image classifier', () => {
  // let classifier;

  it('true', () => {
    expect(true).toBe(true);
  });
  // beforeEach((done) => {
  //   jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  //   classifier = new ImageClassifier.default('', {}, () => {
  //     done();
  //   });
  // });

  // it('Should create a classifier with all the defaults', () => {
  //   expect(classifier.learningRate).toBe(DEFAULTS.learningRate);
  //   expect(classifier.learningRate).toBe(DEFAULTS.learningRate);
  //   expect(classifier.hiddenUnits).toBe(DEFAULTS.hiddenUnits);
  //   expect(classifier.epochs).toBe(DEFAULTS.epochs);
  //   expect(classifier.numClasses).toBe(DEFAULTS.numClasses);
  //   expect(classifier.batchSize).toBe(DEFAULTS.batchSize);
  // });

  // it('Should load the model', () => {
  //   expect(classifier.modelLoaded).toBe(true);
  // });

  // it('Should classify an image', (done) => {
  //   const img = new Image();
  //   img.crossOrigin = '';
  //   img.src = 'https://ml5js.org/docs/assets/img/bird.jpg';
  //   img.onload = () => {
  //     classifier.predict(img, (results) => {
  //       console.log(results);
  //     });
  //     done();
  //   };
  // });
});
