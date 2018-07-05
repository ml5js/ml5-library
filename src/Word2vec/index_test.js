const { tf, word2vec } = ml5;

const URL = 'https://raw.githubusercontent.com/ml5js/ml5-examples/master/p5js/Word2Vec/data/wordvecs1000.json';

describe('word2vec', () => {
  let word2vecInstance;
  let numTensorsBeforeAll;
  let numTensorsBeforeEach;
  beforeAll((done) => {
    numTensorsBeforeAll = tf.memory().numTensors;
    word2vecInstance = word2vec(URL, done);
  });

  afterAll(() => {
    word2vecInstance.dispose();
    const numTensorsAfterAll = tf.memory().numTensors;
    if (numTensorsBeforeAll !== numTensorsAfterAll) {
      throw new Error(`Leaking Tensors (${numTensorsAfterAll} vs ${numTensorsBeforeAll})`);
    }
  });

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
      ready: true,
      modelSize: 1,
    }));
  });

  describe('getRandomWord', () => {
    it('returns a word', () => {
      const word = word2vecInstance.getRandomWord();
      expect(typeof word).toEqual('string');
    });
  });

  describe('nearest', () => {
    it('returns a sorted array of nearest words', () => {
      for (let i = 0; i < 100; i += 1) {
        const word = word2vecInstance.getRandomWord();
        const nearest = word2vecInstance.nearest(word);
        let currentDistance = 0;
        for (let { word, distance: nextDistance } of nearest) {
          expect(typeof word).toEqual('string');
          expect(nextDistance).toBeGreaterThan(currentDistance);
          currentDistance = nextDistance;
        }
      }
    });

    it('returns a list of the right length', () => {
      for (let i = 0; i < 100; i += 1) {
        const word = word2vecInstance.getRandomWord();
        const nearest = word2vecInstance.nearest(word, i);
        expect(nearest.length).toEqual(i);
      }
    });
  });

  describe('add', () => {
    it('returns a value', () => {
      const word1 = word2vecInstance.getRandomWord();
      const word2 = word2vecInstance.getRandomWord();
      const sum = word2vecInstance.subtract([word1, word2]);
      expect(sum[0].distance).toBeGreaterThan(0);
    });
  });

  describe('subtract', () => {
    it('returns a value', () => {
      const word1 = word2vecInstance.getRandomWord();
      const word2 = word2vecInstance.getRandomWord();
      const sum = word2vecInstance.subtract([word1, word2]);
      expect(sum[0].distance).toBeGreaterThan(0);
    });
  });

  describe('average', () => {
    it('returns a value', () => {
      const word1 = word2vecInstance.getRandomWord();
      const word2 = word2vecInstance.getRandomWord();
      const average = word2vecInstance.average([word1, word2]);
      expect(average[0].distance).toBeGreaterThan(0);
    });
  });
});
