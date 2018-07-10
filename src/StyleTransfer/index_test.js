// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


const { styleTransfer } = ml5;

const STYLE_TRANSFER_MODEL = 'https://rawgit.com/ml5js/ml5-data-and-models/master/models/style-transfer/matta/';
const STYLE_TRANSFER_DEFAULTS = {
  size: 200,
};

describe('styleTransfer', () => {
  let style;

  async function getImage() {
    const img = new Image();
    img.crossOrigin = true;
    img.src = 'https://ml5js.org/docs/assets/img/bird.jpg';
    await new Promise((resolve) => { img.onload = resolve; });
    return img;
  }

  beforeAll(async () => {
    // jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
    // style = styleTransfer(STYLE_TRANSFER_MODEL);
  });

  it('instantiates styleTransfer', () => {
    // expect(style.size).toBe(STYLE_TRANSFER_DEFAULTS.size);
  });

  // it('styles an image', async () => {
  //   const image = await getImage();
  //   style.transfer(image, (err, result) => {
  //     expect(result.src).Any(String);
  //   });
  // });
});
