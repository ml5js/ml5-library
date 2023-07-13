// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { asyncLoadImage } from '../utils/testingUtils';
import imageClassifier from './index';

// TODO: find a current URL
const TM_URL = 'https://storage.googleapis.com/tm-models/WfgKPytY/model.json';

async function getCanvas() {
  const img = await asyncLoadImage('robin');
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
      classifier = await imageClassifier('MobileNet');
    });

    describe('instantiate', () => {
      
      it('Should create a classifier with all the defaults', async () => {
        await expect(classifier.ready).resolves.toBeTruthy();
      });
    })

    describe('classify', () => {

      it('Should classify an image of a Robin', async () => {
        const img = await asyncLoadImage('robin');
        const results = await classifier.classify(img);
        expect(results[0].label).toBe('robin, American robin, Turdus migratorius');
        expect(results[0].confidence).toBeGreaterThan(0.9);
      });

      it('Should classify an image of a koala', async () => {
        const img = await asyncLoadImage('koala');
        const results = await classifier.classify(img);
        expect(results[0].label).toBe('koala, koala bear, kangaroo bear, native bear, Phascolarctos cinereus');
        expect(results[0].confidence).toBeGreaterThan(0.8); // Note: mobilenet confidence on this image is lower
      })

      // TODO: move these tests elsewhere -- it's really a test of handleArguments.
      it('Should support p5 elements with an image on .elt', async () => {
        const img = await asyncLoadImage('robin');
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


  describe('imageClassifier with darknet', () => {

    beforeAll(async () => {
      classifier = await imageClassifier('darknet');
    });

    it('Should classify an image of a Robin', async () => {
      const img = await asyncLoadImage('robin');
      const results = await classifier.classify(img);
      expect(results[0].label).toBe('robin');
      expect(results[0].confidence).toBeGreaterThan(0.9);
    });

    it('Should classify an image of a koala', async () => {
      const img = await asyncLoadImage('koala');
      const results = await classifier.classify(img);
      expect(results[0].label).toBe('koala');
      expect(results[0].confidence).toBeGreaterThan(0.9);
    })
  });


  describe('imageClassifier with darknet-tiny', () => {

    beforeAll(async () => {
      classifier = await imageClassifier('darknet-tiny');
    });

    it('Should classify an image of a Robin', async () => {
      const img = await asyncLoadImage('robin');
      const results = await classifier.classify(img);
      expect(results[0].label).toBe('robin');
      expect(results[0].confidence).toBeGreaterThan(0.9);
    });

    it('Should classify an image of a koala', async () => {
      const img = await asyncLoadImage('koala');
      const results = await classifier.classify(img);
      expect(results[0].label).toBe('koala');
      expect(results[0].confidence).toBeGreaterThan(0.9);
    })
  });


  describe('imageClassifier with doodlenet', () => {

    beforeAll(async () => {
      classifier = await imageClassifier('doodlenet');
    });

    it('Should classify a sketch', async () => {
      // TODO: need to save a doodle to a URL
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
    await expect(classifier.ready).resolves.toBeTruthy();
  });

  describe('classify', () => {
    it('Should support video', async () => {
      const results = await classifier.classify()
      expect(results[0].label).not.toBe(null);
      expect(results[0].label).toBe('bird');
    });
  });
});
