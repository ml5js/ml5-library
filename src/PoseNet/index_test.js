// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const { poseNet } = ml5;

const POSENET_IMG = 'https://github.com/ml5js/ml5-adjacent/raw/master/02_ImageClassification_Video/starter.png';

const POSENET_DEFAULTS = {
  imageScaleFactor: 0.3,
  flipHorizontal: false,
  minConfidence: 0.5,
  detectionType: 'multiple',
  multiplier: 0.75,
};

describe('PoseNet', () => {
  let net;

  async function getImage() {
    const img = new Image();
    img.crossOrigin = '';
    img.src = POSENET_IMG;
    await new Promise((resolve) => { img.onload = resolve; });
    return img;
  }

  beforeAll(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    net = await poseNet();
  });

  it('instantiates poseNet', () => {
    expect(net.imageScaleFactor).toBe(POSENET_DEFAULTS.imageScaleFactor);
    expect(net.flipHorizontal).toBe(POSENET_DEFAULTS.flipHorizontal);
    expect(net.minConfidence).toBe(POSENET_DEFAULTS.minConfidence);
    expect(net.detectionType).toBe(POSENET_DEFAULTS.detectionType);
    expect(net.multiplier).toBe(POSENET_DEFAULTS.multiplier);
  });

  // it('detects poses in image', async () => {
  //   const image = await getImage();
  //   const pose = net.singlePose(image);
  //   // expect(pose).toBe('');
  // });
});
