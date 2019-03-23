// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const { YOLO } = ml5;

const YOLO_DEFAULTS = {
  iouThreshold: 0.4,
  classProbThreshold: 0.4,
  modelSize: 416,
};

describe('YOLO', () => {
  let yolo;

  async function getRobin() {
    const img = new Image();
    img.crossOrigin = '';
    img.src = 'https://ml5js.org/docs/assets/img/bird.jpg';
    await new Promise((resolve) => { img.onload = resolve; });
    return img;
  }

  beforeEach(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
    yolo = await YOLO();
  });

  it('instantiates the YOLO classifier with defaults', () => {
    expect(yolo.IOUThreshold).toBe(YOLO_DEFAULTS.IOUThreshold);
    expect(yolo.classProbThreshold).toBe(YOLO_DEFAULTS.classProbThreshold);
    expect(yolo.modelSize).toBe(YOLO_DEFAULTS.modelSize);
  });

  it('detects a robin', async () => {
    const robin = await getRobin();
    await yolo.detect(robin)
      .then(detection => expect(detection[0].label).toBe('bird'));
  });
});
