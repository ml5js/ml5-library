/* eslint new-cap: 0 */

const { tf, imageClassifier } = ml5;

const DEFAULTS = {
  learningRate: 0.0001,
  hiddenUnits: 100,
  epochs: 20,
  numClasses: 2,
  batchSize: 0.4,
  topk: 3,
  alpha: 1,
  version: 1,
};

describe('Create an image classifier', () => {
  let classifier;

  beforeEach(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    classifier = await imageClassifier('MobileNet', undefined, {});
  });

  it('Should create a classifier with all the defaults', async () => {
    expect(classifier.version).toBe(DEFAULTS.version);
    expect(classifier.alpha).toBe(DEFAULTS.alpha);
    expect(classifier.topk).toBe(DEFAULTS.topk);
    expect(classifier.ready).toBeTruthy();
  });

  it('Should classify an robin, American robin, Turdus migratorius', async () => {
    const img = new Image();
    img.crossOrigin = '';
    img.src = 'https://ml5js.org/docs/assets/img/bird.jpg';
    await new Promise((resolve) => { img.onload = resolve; });
    classifier.predict(img)
      .then(results => expect(results[0].className).toBe('robin, American robin, Turdus migratorius'));
  });
});
