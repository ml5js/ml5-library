// Copyright (c) 2020 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { asyncLoadImage } from "../utils/testingUtils";
import handpose from './index';

const HANDPOSE_IMG = 'https://i.imgur.com/EZXOjqh.jpg';

describe('Handpose', () => {
  let handposeInstance;
  let testImage;

  beforeAll(async () => {
    jest.setTimeout(10000);
    handposeInstance = await handpose();
  });

  it('detects poses in image', async () => {
    testImage = await asyncLoadImage(HANDPOSE_IMG);
    const handPredictions = await handposeInstance.predict(testImage);
    expect(handPredictions).not.toHaveLength(0);
    expect(handPredictions[0].landmarks).toBeDefined();
  });
});
