// import { SqueezeNet } from 'deeplearn-squeezenet';
// import { MobileNet } from './MobileNet';
// import ImageClassifier from './index';

// describe('SqueezeNet Classifier', () => {
//   let SqueezeNetClassifier;
//   beforeAll((done) => {
//     SqueezeNetClassifier = new ImageClassifier('SqueezeNet');
//     done();
//   });

//   // TODO: Check that the right net is created:
//   // toEqual compares tf.tensors and since they have different ids they don't match
//   it('creates a new instance', (done) => {
//     expect(SqueezeNetClassifier).toEqual(jasmine.objectContaining({
//       model: 'SqueezeNet',
//       readyPromise: null,
//       video: null,
//     }));
//     done();
//   });

  // it('makes a prediction', (done) => {
  //   const img = document.createElement('img');
  //   img.src = 'https://ml5js.github.io/docs/assets/img/bird.jpg';
  //   SqueezeNetClassifier.predict(img, 10, (results) => {
  //     expect(results[0].probability).toEqual('robin, American robin, Turdus migratorius');
  //     done();
  //   });
  // });
// });
