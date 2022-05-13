// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { asyncLoadImage } from "../utils/testingUtils";
import poseNet from './index';

const POSENET_IMG = 'https://github.com/ml5js/ml5-adjacent/raw/master/02_ImageClassification_Video/starter.png';

const POSENET_DEFAULTS = {
  architecture: 'MobileNetV1',
  outputStride: 16,
  flipHorizontal: false,
  minConfidence: 0.5,
  maxPoseDetections: 5,
  scoreThreshold: 0.5,
  nmsRadius: 20,
  detectionType: 'multiple',
  inputResolution: 256,
  multiplier: 0.75,
  quantBytes: 2
};

describe('PoseNet', () => {
  let net;

  beforeAll(async () => {
    jest.setTimeout(10000);
    net = await poseNet();
  });

  it('instantiates poseNet', () => {
    expect(net.architecture).toBe(POSENET_DEFAULTS.architecture);
    expect(net.outputStride).toBe(POSENET_DEFAULTS.outputStride);
    expect(net.inputResolution).toBe(POSENET_DEFAULTS.inputResolution);
    expect(net.multiplier).toBe(POSENET_DEFAULTS.multiplier);
    expect(net.quantBytes).toBe(POSENET_DEFAULTS.quantBytes);
  });

  it('detects poses in image', async () => {
    const image = await asyncLoadImage(POSENET_IMG);

    // Result should be an array with a single object containing pose and skeleton.
    const result = await net.singlePose(image);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('pose');
    expect(result[0]).toHaveProperty('skeleton');

    // Verify a known outcome.
    const nose = result[0].pose.keypoints.find(keypoint => keypoint.part === "nose");
    expect(nose).toBeTruthy();
    expect(nose.position.x).toBeCloseTo(448.6, 0);
    expect(nose.position.y).toBeCloseTo(255.9, 0);
    expect(nose.score).toBeCloseTo(0.999);
  });
});
