import ImageClassifier from './index';

describe('Initialize the classifier', () => {
  const classifierDefaultProperties = {
    readyPromise: null,
  };
  let classifier;
  beforeEach(() => {
    classifier = new ImageClassifier('SqueezeNet');
  });

  it('create a new classifier with the specified model', () => {
    expect(classifier).toEqual(jasmine.objectContaining(classifierDefaultProperties));
  });
});
