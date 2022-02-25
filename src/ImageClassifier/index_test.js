// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { getRobin } from "../utils/testingUtils";
import imageClassifier from './index';

const TM_URL = 'https://storage.googleapis.com/tm-models/WfgKPytY/model.json';

const DEFAULTS = {
  learningRate: 0.0001,
  hiddenUnits: 100,
  epochs: 20,
  numClasses: 2,
  batchSize: 0.4,
  topk: 3,
  alpha: 1,
  version: 2,
};

async function getCanvas() {
  const img = await getRobin();
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext('2d').drawImage(img, 0, 0);
  return canvas;
}

describe('imageClassifier', () => {
  let classifier;

  /**
   * Test imageClassifier with teachable machine
   */
  // Teachable machine model
  describe('with Teachable Machine model', () => {

    beforeAll(async () => {
      jest.setTimeout(30000);
      classifier = await imageClassifier(TM_URL, undefined, {});
    });

    describe('instantiate', () => {
      it('Should create a classifier with all the defaults', async () => {
        expect(classifier.modelUrl).toBe(TM_URL);
      });
    });

  });



  /**
   * Test imageClassifier with Mobilenet
   */
  describe('imageClassifier with Mobilenet', () => {

    beforeAll(async () => {
      jest.setTimeout(30000);
      classifier = await imageClassifier('MobileNet', undefined, {});
    });

    describe('instantiate', () => {

      it('Should create a classifier with all the defaults', async () => {
        expect(classifier.version).toBe(DEFAULTS.version);
        expect(classifier.alpha).toBe(DEFAULTS.alpha);
        expect(classifier.topk).toBe(DEFAULTS.topk);
        expect(classifier.ready).toBeTruthy();
      });
    })

    describe('classify', () => {

      it('Should classify an image of a Robin', async () => {
        const img = await getRobin();
        await classifier.classify(img)
          .then(results => expect(results[0].label).toBe('robin, American robin, Turdus migratorius'));
      });

      it('Should support p5 elements with an image on .elt', async () => {
        const img = await getRobin();
        await classifier.classify({
          elt: img
        })
          .then(results => expect(results[0].label).toBe('robin, American robin, Turdus migratorius'));
      });

      it('Should support HTMLCanvasElement', async () => {
        const canvas = await getCanvas();
        await classifier.classify(canvas)
          .then(results => expect(results[0].label).toBe('robin, American robin, Turdus migratorius'));
      });

      it('Should support p5 elements with canvas on .canvas', async () => {
        const canvas = await getCanvas();
        await classifier.classify({
          canvas
        })
          .then(results => expect(results[0].label).toBe('robin, American robin, Turdus migratorius'));
      });

      it('Should support p5 elements with canvas on .elt', async () => {
        const canvas = await getCanvas();
        await classifier.classify({
          elt: canvas
        })
          .then(results => expect(results[0].label).toBe('robin, American robin, Turdus migratorius'));
      });
    });

  });
});

describe('videoClassifier', () => {
  let classifier;
  async function getVideo() {
    const video = document.createElement('video');
    video.crossOrigin = true;
    video.src = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-library@main/assets/pelican.mp4' /* TODO add univeral url */;
    video.width = 200;
    video.height = 200;
    return video;
  }

  beforeEach(async () => {
    jest.setTimeout(30000);
    const video = await getVideo();
    // FIXME: onload promise for video load prevented it from working and seems like something that might be necessary in different scenarios
    classifier = await imageClassifier('MobileNet', video, {});
  });

  it('Should create a classifier with all the defaults', async () => {
    expect(classifier.version).toBe(DEFAULTS.version);
    expect(classifier.alpha).toBe(DEFAULTS.alpha);
    expect(classifier.topk).toBe(DEFAULTS.topk);
    expect(classifier.ready).toBeTruthy();
  });

  describe('classify', () => {
    it('Should support video', async () => {
      const results = await classifier.classify()
      expect(results[0].label).not.toBe(null);
    });
  });
});
