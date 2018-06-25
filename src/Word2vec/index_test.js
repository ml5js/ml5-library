import word2Vec from './index';

const URL = 'https://raw.githubusercontent.com/ml5js/ml5-examples/master/p5js/Word2Vec/data/wordvecs1000.json';

describe('initialize word2vec', () => {
  let word2vec;

  beforeEach(async () => {
    word2vec = await word2Vec(URL);
  });

  it('creates a new instance', () => {
    expect(word2vec).toEqual(jasmine.objectContaining({
      modelSize: 1,
    }));
  });

  it('computes nearest words', () => {
    expect(word2vec.nearest('love', 5).map(v => v.vector))
      .toEqual(['loved', 'loves', 'hate', 'wonderful', 'beautiful']);
  });
});
