// Copyright (c) 2020 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import handpose from './index';

const HANDPOSE_IMG = 'https://i.imgur.com/EZXOjqh.jpg';

describe('Handpose', () => {
  let handposeInstance;
  let testImage;

  async function loadHTMLImageElement(imageSrc) {
    const img = new Image();
    img.crossOrigin = true;
    img.src = imageSrc;
    await new Promise((resolve) => { img.onload = resolve; });
    return img;
  }

  beforeAll(async () => {
    jest.setTimeout(10000);
    handposeInstance = await handpose();
  });

  it('detects poses in image', async () => {
    testImage = await loadHTMLImageElement(HANDPOSE_IMG);
    const handPredictions = await handposeInstance.predict(testImage);
    expect(handPredictions).not.toHaveLength(0);
    expect(handPredictions[0].landmarks).toBeDefined();
  });
});
