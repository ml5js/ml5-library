// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


import { getRobin } from "../utils/testingUtils";
import styleTransfer from './index';

const STYLE_TRANSFER_MODEL = 'https://rawgit.com/ml5js/ml5-data-and-models/master/models/style-transfer/matta/';
const STYLE_TRANSFER_DEFAULTS = {
  size: 200,
};

describe('styleTransfer', () => {
  let style;

  beforeAll(async () => {
    jest.setTimeout(100000);
    style = await styleTransfer(STYLE_TRANSFER_MODEL);
  });

  it('instantiates styleTransfer', () => {
    expect(style.size).toBe(STYLE_TRANSFER_DEFAULTS.size);
  });

  it('styles an image', async () => {
    expect.assertions(1);
    const image = await getRobin();
    const result = await style.transfer(image);
    expect(result.src).toBeDefined();
  });
});
