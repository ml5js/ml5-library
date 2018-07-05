/* eslint new-cap: 0 */

import YOLO from './index';

async function getRobin() {
  const img = new Image();
  img.crossOrigin = '';
  img.src = 'https://ml5js.org/docs/assets/img/bird.jpg';
  await new Promise((resolve) => { img.onload = resolve; });
  return img;
}

describe('YOLO', () => {
  let yolo;

  beforeEach(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
    yolo = await YOLO();
  });

  it('instantiates a classifier', () => {
    expect(yolo).toBeTruthy();
  });

  it('classifies the robin', async () => {
    const robin = await getRobin();
    const detection = await yolo.detect(robin);
    expect(robin).toBeTruthy();
  });
});
