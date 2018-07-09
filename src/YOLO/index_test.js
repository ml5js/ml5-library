// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const { YOLO } = ml5;

const YOLO_DEFAULTS = {
  IOUThreshold: 0.4,
  classProbThreshold: 0.4,
  filterBoxesThreshold: 0.01,
  size: 416,
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
    expect(yolo.filterBoxesThreshold).toBe(YOLO_DEFAULTS.filterBoxesThreshold);
    expect(yolo.size).toBe(YOLO_DEFAULTS.size);
  });

  it('detects a robin', async () => {
    const robin = await getRobin();
    const detection = await yolo.detect(robin);
    expect(detection[0].className).toBe('bird');
  });
});
