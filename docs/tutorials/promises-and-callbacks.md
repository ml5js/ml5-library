# Promises and Callback support in ml5

ml5.js is heavily inspired by the syntax, patterns and style of the [p5.js](https://p5js.org/) library. However, there are several differences in how asynchronous operations are handled by ml5.js. ml5.js supports both <b>error-first callbacks</b> and Promises in all methods.

## Using Callbacks

In [p5.js](https://p5js.org/), [callbacks](https://developer.mozilla.org/en-US/docs/Glossary/Callback_function) are passed as arguments to functions that often perform some asynchronous operation. For example, [p5.js](https://p5js.org/) defines the [**loadJSON()**](https://p5js.org/reference/#/p5/loadJSON) function as the following:

```js
loadJSON('http//example.com/data.json', (results) => {
  // Do something with the results
});
```

Notice that the results from the callback in [p5.js](https://p5js.org/) are given as the only argument to the function. There is no error argument in the callback.

ml5.js, on the other hand, uses a pattern referred to as an <b>error-first callback</b>:

> With this pattern, a callback function is passed to the method as an argument. When the operation either completes or an error is raised, the callback function is called with the Error object (if any) passed as the first argument. If no error was raised, the first argument will be passed as null. [Taken from the Node.js documentation](https://nodejs.org/api/errors.html#errors_error_first_callbacks)

For example if you are using the **imageClassifier()** method, you will need to construct it in the following way:

```js
// Pass a callback function to constructor
const classifier = ml5.imageClassifier('MobileNet', (err, model) => {
  console.log('Model Loaded!');
});

// Make a prediction with the selected image and pass a callback function with two arguments
classifier.predict(image, (err, results) => {
  // Check for errors. If no errors, then do something with the results
});
```

Error first callbacks is a convention common to many JavaScript libraries that we have chosen to adopt. The language JavaScript itself does not enforce this pattern. Keep in mind that most ml5.js methods and functions are asynchronous (machine learning models can take significant amounts of time to process inputs and generate outputs!). You will need to use the <b>error-first callback</b> pattern if you want to use callbacks.

## Using Promises

ml5.js also supports [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). If no callback is provided to any asynchronous function then a Promise is returned.

With Promises, the image classification example can be used in the following way:

```js
// No callback needs to be passed to use Promises.
ml5
  .imageClassifier('MobileNet')
  .then(classifier => classifier.predict(image))
  .then((results) => {
    // Do something with the results
  });
```

For some video tutorials about Promises, you can find this [Coding Train playlist](https://www.youtube.com/playlist?list=PLRqwX-V7Uu6bKLPQvPRNNE65kBL62mVfx). There is also a [video tutorial about the ES6 arrow notation (**=>**)](https://youtu.be/mrYMzpbFz18).
