// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint no-loop-func: 0 */
const { tf, word2vec } = ml5;

const W2V_MODEL_URL = 'https://raw.githubusercontent.com/ml5js/ml5-data-and-training/master/models/wordvecs/common-english/wordvecs1000.json';

describe('word2vec', () => {
  let word2vecInstance;
  let numTensorsBeforeAll;
  let numTensorsBeforeEach;
  beforeAll((done) => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
    numTensorsBeforeAll = tf.memory().numTensors;
    word2vecInstance = word2vec(W2V_MODEL_URL, done);
  });

  // afterAll(() => {
  //   word2vecInstance.dispose();
  //   const numTensorsAfterAll = tf.memory().numTensors;
  //   if (numTensorsBeforeAll !== numTensorsAfterAll) {
  //     throw new Error(`Leaking Tensors (${numTensorsAfterAll} vs ${numTensorsBeforeAll})`);
  //   }
  // });

  beforeEach(() => {
    numTensorsBeforeEach = tf.memory().numTensors;
  });

  afterEach(() => {
    const numTensorsAfterEach = tf.memory().numTensors;
    if (numTensorsBeforeEach !== numTensorsAfterEach) {
      throw new Error(`Leaking Tensors (${numTensorsAfterEach} vs ${numTensorsBeforeEach})`);
    }
  });

  it('creates a new instance', () => {
    expect(word2vecInstance).toEqual(jasmine.objectContaining({
      modelLoaded: true,
      modelSize: 1000,
    }));
  });

  describe('getRandomWord', () => {
    it('returns a random word', () => {
      word2vecInstance.getRandomWord()
        .then(word => expect(typeof word).toEqual('string'));
    });
  });

  describe('nearest', () => {
    it('returns a sorted array of nearest words', () => {
      for (let i = 0; i < 100; i += 1) {
        word2vecInstance.getRandomWord()
          .then(word => word2vecInstance.nearest(word))
          .then((nearest) => {
            let currentDistance = 0;
            for (let { word, distance: nextDistance } of nearest) {
              expect(typeof word).toEqual('string');
              expect(nextDistance).toBeGreaterThan(currentDistance);
              currentDistance = nextDistance;
            }
          })
      }
    });

    it('returns a list of the right length', () => {
      for (let i = 0; i < 100; i += 1) {
        word2vecInstance.getRandomWord()
          .then(word => word2vecInstance.nearest(word, i))
          .then(nearest => expect(nearest.length).toEqual(i));
      }
    });
  });
  describe('add', () => {
    it('cat + dog = horse', () => {
      word2vecInstance.add(['cat', 'dog'], 1)
        .then(result => expect(result[0].word).toBe('horse'));
    });
  });

  describe('subtract', () => {
    it('cat - dog = fish', () => {
      word2vecInstance.subtract(['cat', 'dog'], 1)
        .then(result => expect(result[0].word).toBe('fish'));
    });
  });

  describe('average', () => {
    it('moon & sun = avenue', () => {
      word2vecInstance.average(['moon', 'sun'], 1)
        .then(result => expect(result[0].word).toBe('earth'));
    });
  });
});
