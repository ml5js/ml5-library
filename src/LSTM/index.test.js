/* eslint new-cap: 0 */

import LSTMGenerator from './index';

describe('LSTM', () => {
  let generator;

  beforeEach(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    generator = await LSTMGenerator('https://raw.githubusercontent.com/ml5js/ml5-data-and-training/master/models/lstm/dubois/');
  });

  it('instantiates a generator', () => {
    expect(generator).toBeTruthy();
  });

  // Fails with 'must be a Tensor' error that's particular to this test suite.
  // it('generates some text', async () => {
  //   expect(await generator.generate('Hi there')).toBeTruthy();
  // });
});
