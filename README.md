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
- [LSTM Interactive](examples/lstm_1)

## API Reference
 
- [LSTM](#lstm)

### LSTM

> Use a LSTM pretrained model and run it in inference mode. Returns an object.

```javascript
var lstm = new p5ML.LSTM(path);
lstm.generate([options], callback)
```

- _path_: The folder where the deeplearn.js model is.  
- _options_: An object that specifies the seed, length and temperature of the input. Defaults to `{seed: "a", length:20, temperature:0.5}`
- _callback_: A function to execute once the model has run. 

See [this](examples/lstm_1) and [this](examples/lstm_1) examples.

## Develop

First clone the repo and install dependencies
```bash
git clone https://github.com/ITPNYU/p5ML.git
cd p5ML
yarn
```

To devolop and run a server
```bash
webpack-dev-server
```

To build:
```bash
yarn build
```

To commit:
```bash
yarn commit
```








