// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// const { objectDetector } = ml5;

// describe('ObjectDetector', () => {
//   let detector;

//   beforeAll(async () => {
//     jasmine.DEFAULT_TIMEOUT_INTERVAL = 500000;
//     detector = await ml5.objectDetector('cocossd');
//   });

//   it('throws error when a non image is trying to be detected', async () => {
//     const notAnImage = 'not_an_image'
//     try {
//       await detector.detect(notAnImage);
//       fail('Error should have been thrown');
//     }
//     catch (error) {
//       expect(error.message).toBe('Detection subject not supported');
//     }
//   });
// });

const COCOSSD_DEFAULTS = {
  base: 'lite_mobilenet_v2',
  modelUrl: undefined,
}

describe('objectDetector with cocossd', () => {
  let cocoDetector;

  async function getRobin() {
    const img = new Image();
    img.crossOrigin = '';
    img.src = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-library@development/assets/bird.jpg';
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    return img;
  }

  async function getImageData() {
    const arr = new Uint8ClampedArray(20000);

    // Iterate through every pixel
    for (let i = 0; i < arr.length; i += 4) {
      arr[i + 0] = 0; // R value
      arr[i + 1] = 190; // G value
      arr[i + 2] = 0; // B value
      arr[i + 3] = 255; // A value
    }

    // Initialize a new ImageData object
    const img = new ImageData(arr, 200);
    return img;
  }

  describe('cocossd', () => {

    beforeAll(async () => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 500000;
      cocoDetector = await ml5.objectDetector('cocossd');
    });


    it('Should instantiate with the following defaults', () => {
      expect(cocoDetector.config.base).toBe(COCOSSD_DEFAULTS.base);
      expect(cocoDetector.config.modelUrl).toBe(COCOSSD_DEFAULTS.modelUrl);
    });

    it('detects a robin', async () => {
      const robin = await getRobin();
      const detection = await cocoDetector.detect(robin);
      expect(detection[0].label).toBe('bird');
    });

    it('detects takes ImageData', async () => {
      const img = await getImageData();
      const detection = await cocoDetector.detect(img);
      expect(detection).toEqual([]);
    });


  });

});