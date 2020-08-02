# ml5 Examples

## Description

The examples are meant to serve as an introduction to the library and machine learning concepts.

Examples are organized into folders according to their integration with other JavaScript libraries.

For example, the `examples/p5js` folder holds examples of using [ml5.js](https://github.com/ml5js/ml5-library) with [p5.js](https://p5js.org/). All examples are self-contained and can be run independently. Libraries are loaded through a Content Delivery Network (CDN) and certain examples (indicated in code comments) download a machine learning model from a "cloud" url. This means that ml5 currently relies on an internet connection in order to retrieve pre-trained models (unless they are served locally). 

Instead of using the CDN links to p5 and ml5, you can [download the p5.js libraries here](https://github.com/processing/p5.js/releases) and [ml5 library here](https://github.com/ml5js/ml5-library/releases).

## Setup

### Step 1: or clone this repository:

Open your terminal and type:

```sh
# clone the repo or download the zip file
git clone https://github.com/ml5js/ml5-library.git
```

### Step 2: start a local development server
Open your terminal

```sh
# change directories
cd ml5-library

# install the dependencies
npm install

# run the local web server
npm run develop

# you should be able to run the examples at: 
# localhost:8081

```

If you don't know how to start a server, check [this guide on how to start a local web server](https://learn.ml5js.org/docs/#/tutorials/local-web-server?id=running-a-local-web-server).


## Examples Index

* [ml5 examples in the p5 web editor](https://editor.p5js.org/ml5/sketches)
  * The best way to interact with our examples are using the [p5 web editor](https://editor.p5js.org/ml5/sketches). This is an interactive coding environment.
* Run the examples using the [example index](https://examples.ml5js.org/)
  * We have examples written in plain javascript, p5.js, and more.


## Contributing

See CONTRIBUTING.MD

## Contributors

* See: [ml5 contributors](https://github.com/ml5js/ml5-library#contributors)