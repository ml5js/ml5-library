// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const { LSTMGenerator } = ml5;

const LSTM_MODEL_URL = 'https://raw.githubusercontent.com/ml5js/ml5-data-and-models/master/models/lstm/woolf/';
const LSTM_MODEL_DEFAULTS = {
  cellsAmount: 2,
  vocabSize: 90,
  firstChar: 61,
};

describe('LSTMGenerator', () => {
  let lstm;

  beforeEach(async () => {
    // This never resolves.
    // lstm = await LSTMGenerator(LSTM_MODEL_URL);
  });

  it('instantiates a lstm generator', () => {
    // expect(lstm.cellsAmount).toBe(LSTM_MODEL_DEFAULTS.cellsAmount);
    // expect(lstm.vocabSize).toBe(DEFAULTS.vocabSize);
    // expect(lstm.vocab[0]).toBe(DEFAULTS.firstChar);
  });
});
