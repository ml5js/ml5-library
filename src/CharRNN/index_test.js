// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import charRNN from './index';

const RNN_MODEL_URL = 'https://raw.githubusercontent.com/ml5js/ml5-data-and-models/master/models/lstm/woolf';

const RNN_MODEL_DEFAULTS = {
  cellsAmount: 2,
  vocabSize: 223
};

const RNN_DEFAULTS = {
  seed: 'a',
  length: 20,
  temperature: 0.5,
  stateful: false
}

const RNN_OPTIONS = {
  seed: 'the meaning of pizza is: ',
  length: 10,
  temperature: 0.7
}

describe('charRnn', () => {
  let rnn;

  beforeAll(async () => {
    jest.setTimeout(20000); // set extra long interval due to issues with CharRNN generation time
    rnn  = await charRNN(RNN_MODEL_URL, undefined);
  });

  //  it('loads the model with all the defaults', async () => {
  //    expect(rnn.cellsAmount).toBe(RNN_MODEL_DEFAULTS.cellsAmount);
  //    expect(rnn.vocabSize).toBe(RNN_MODEL_DEFAULTS.vocabSize);
  //  });

  describe('generate', () => {
    it('instantiates an rnn with all the defaults', async () => {
      expect(rnn.ready).toBeTruthy();
      expect(rnn.defaults.seed).toBe(RNN_DEFAULTS.seed);
      expect(rnn.defaults.length).toBe(RNN_DEFAULTS.length);
      expect(rnn.defaults.temperature).toBe(RNN_DEFAULTS.temperature);
      expect(rnn.defaults.stateful).toBe(RNN_DEFAULTS.stateful);
    });
    
    it('Should generate content that follows default options if given an empty object', async() => {
      const result = await rnn.generate({});
      expect(result.sample.length).toBe(20);
    });

    it('generates content that follows the set options', async() => {
      const result = await rnn.generate(RNN_OPTIONS);
      expect(result.sample.length).toBe(RNN_OPTIONS.length);
    });
  });
});
