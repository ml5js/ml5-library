// Copyright (c) 2020 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { asyncLoadImage } from "../utils/testingUtils";
import facemesh from './index';

const FACEMESH_IMG = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models@master/tests/images/harriet_128x128.jpg';

describe('Facemesh', () => {
  let facemeshInstance;
  let testImage;

  beforeAll(async () => {
    jest.setTimeout(10000);
    facemeshInstance = await facemesh();
  });

  it('detects poses in image', async () => {
    testImage = await asyncLoadImage(FACEMESH_IMG);
    const facePredictions = await facemeshInstance.predict(testImage);
    expect(facePredictions[0].mesh).toBeDefined();
  });
});
