/* eslint new-cap: 0 */

const { ImageClassifier } = ml5;

const DEFAULTS = {
  learningRate: 0.0001,
  hiddenUnits: 100,
  epochs: 20,
  numClasses: 2,
  batchSize: 0.4,
};

describe('underlying Mobilenet', () => {
  // This is the core issue: Mobilenet itself cannot be initialized
  // in the karma / webpack / etc environment
  it('Can initialize mobilenet', async () => {
    await mobilenet.load();
  });
});

describe('Create an image classifier', () => {
  let classifier;


  // beforeEach(async () => {
  //   jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  //   classifier = await imageClassifier('MobileNet', undefined, {});
  // });

  // it('Should create a classifier with all the defaults', async () => {
  //   expect(classifier.version).toBe(MOBILENET_DEFAULTS.version);
  //   expect(classifier.alpha).toBe(MOBILENET_DEFAULTS.alpha);
  //   expect(classifier.topk).toBe(MOBILENET_DEFAULTS.topk);
  //   expect(classifier.ready).toBeTruthy();
  // });

  // it('Should classify an image', async () => {
  //   const img = new Image();
  //   img.crossOrigin = '';
  //   img.src = 'https://ml5js.org/docs/assets/img/bird.jpg';
  //   await new Promise((resolve) => { img.onload = resolve; });
  //   const results = await classifier.predict(img);
  //   expect(results[0].className).toBe('robin, American robin, Turdus migratorius');
  // });
});
