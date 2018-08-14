// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const { YOLO } = ml5;

const YOLO_DEFAULTS = {
  filterBoxesThreshold: 0.01,
  IOUThreshold: 0.4,
  classProbThreshold: 0.4,
  imageSize: 416,
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
    yolo = ml5.YOLO();
    await yolo.loadModel();
  });

  it('instantiates the YOLO classifier with defaults', () => {
    expect(yolo.IOUThreshold).toBe(YOLO_DEFAULTS.IOUThreshold);
    expect(yolo.classProbThreshold).toBe(YOLO_DEFAULTS.classProbThreshold);
    expect(yolo.filterBoxesThreshold).toBe(YOLO_DEFAULTS.filterBoxesThreshold);
    expect(yolo.imageSize).toBe(YOLO_DEFAULTS.imageSize);
  });

  it('detects a robin', async () => {
    const robin = await getRobin();
    const detection = await yolo.detect(robin);
    expect(detection[0].className).toBe('bird');
  });
});
