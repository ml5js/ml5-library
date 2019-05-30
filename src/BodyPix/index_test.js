// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const { bodyPix } = ml5;

const DEFAULTS = {
    "multiplier": 0.75,
    "outputStride": 16,
    "segmentationThreshold": 0.5
};

describe('bodyPix', () => {
  let bp;

  async function getImage() {
    const img = new Image();
    img.crossOrigin = true;
    img.src = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models@master/tests/images/harriet_128x128.jpg';
    await new Promise((resolve) => { img.onload = resolve; });
    return img;
  }

  async function getCanvas() {
    const img = await getImage();
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0);
    return canvas;
  }

  beforeEach(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
    bp = await bodyPix();
  });

  it('Should create bodyPix with all the defaults', async () => {
    expect(bp.config.multiplier).toBe(DEFAULTS.multiplier);
    expect(bp.config.outputStride).toBe(DEFAULTS.outputStride);
    expect(bp.config.segmentationThreshold).toBe(DEFAULTS.segmentationThreshold);
  });

  describe('segmentation', () => {
    it('Should segment an image of a Harriet Tubman with a width and height of 128', async () => {
      const img = await getImage();
      await bp.segment(img)
        .then(results => {
            expect(results.maskBackground.width).toBe(128);
            expect(results.maskBackground.height).toBe(128);

            expect(results.maskPerson.width).toBe(128);
            expect(results.maskPerson.height).toBe(128);

            expect(results.raw.width).toBe(128);
            expect(results.raw.height).toBe(128);

        })
    });

  });
});
