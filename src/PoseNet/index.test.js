import * as posenet from '@tensorflow-models/posenet';
import poseNet from './index';

describe('underlying PoseNet model', () => {
  it('can be initialized', async () => {
    await posenet.load(0.75);
  });
});

describe('initialize PoseNet', () => {
  let net;
  beforeAll(async () => {
    net = await poseNet();
  });

  it('creates a new instance', () => {
    expect(net).toBeTruthy();
  });
});
