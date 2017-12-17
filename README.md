# p5ML

**_This project is currently in development._**

p5ML is a high level javascript library for machine learning. The main idea of this project is to further reduce the barriers between lower level machine learning and creative outputs using javascript.

p5ML provides two main functionalities:
  - A wrapper around [deeplearn.js](https://github.com/PAIR-code/deeplearnjs) providing a simplier interface, that makes it easier to work with GPU accelerated machine learning in javascript.
  - Custom ML methods.

## Usage 

Download the library from [here](https://raw.githubusercontent.com/ITPNYU/p5-deeplearn-js/master/dist/p5ml.min.js) and import:

```html
<script src="p5ML.min.js"></script>
```

To use with ES6

```bash
npm install p5ML --save
```

## Examples

- [Mnist](examples/mnist)
- [LSTM Simple](examples/lstm_1)
- [LSTM Interactive](examples/lstm_2)
- [Imagenet Simple](examples/imagenet)
- [Imagenet Webcam](examples/imagenetCamera)
- [KNN Image Classifier](examples/KNNImage)

## API Reference
 
- [LSTM](#lstm)
- [ImageNet](#imagenet)
- [KNNImage](#KNNImageClassifier)

### LSTM

> Use a pretrained LSTM model and run it in inference mode. Returns an object.

```javascript
var lstm = new p5ML.LSTM(path);
lstm.generate([options], callback)
```

- _path_: The folder where the deeplearn.js model is.  
- _options_: An object that specifies the seed, length and temperature of the input. Defaults to `{seed: "a", length:20, temperature:0.5}`
- _callback_: A function to execute once the model has run. 

See this [simple example](examples/lstm_1) and this [interactive example](examples/lstm_2).

### ImageNet

> Classify an image using a given model. Returns an array of objects containing categories and probabilities.

```javascript
var imagenet = new p5ml.ImageNet(model);
var prediction = imagenet.predict(img, callback);
```

- _model_: Specify the model to use. For now only 'Squeezenet' is supported. 
- _img_: The DOM element of the image to classify.
- _callback_: A function to execute once the model has run. 

See this [simple example ](examples/imagenet) and this [webcam example](examples/imagenetCamera)

### KNN Image Classifier

> A KNN Image Classifier

```javascript
var knn = new p5ml.KNNImageClassifier(callback);
knn.addImage(video, index);
knn.predict(video, callback);
knn.getClassExampleCount();
knn.clearClass(classIndex);
```

### Neural Network

> A Simple Artificial Neural Network

```javascript
var nn = new p5ml.NeuralNetwork(input_nodes, hidden_nodes, output_nodes, learning_rate);
nn.train(inputs, targets);
var result = nn.query(inputs)
```


## Contributing

See [CONTRIBUTING](CONTRIBUTING.md)








