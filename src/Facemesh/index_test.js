// Copyright (c) 2020 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const { facemesh } = ml5;

const FACEMESH_IMG = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models@master/tests/images/harriet_128x128.jpg';

describe('Facemesh', () => {
  let facemeshInstance;
  let testImage;

  async function loadHTMLImageElement(imageSrc) {
    const img = new Image();
    img.crossOrigin = true;
    img.src = imageSrc;
    await new Promise((resolve) => { img.onload = resolve; });
    return img;
  }

  beforeAll(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    facemeshInstance = await facemesh();
  });

  it('detects poses in image', async () => {
    testImage = await loadHTMLImageElement(FACEMESH_IMG);
    const facePredictions = await facemeshInstance.predict(testImage);
    expect(facePredictions[0].mesh).toBeDefined();
  });
});
