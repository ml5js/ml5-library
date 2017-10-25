/*
p5ML v.0.0.1

p5ML is a high level javascript library for machine learning.
Made @ NYU ITP

*/

'use strict';

import { NeuralNetwork } from './NeuralNetwork/index';

// Check if deeplearn.js is imported
if(window.deeplearn){
  console.log('p5ML loaded!');
} else {
  console.error(`You need to import deeplearn.js!
  Add this to your html page <script src="https://unpkg.com/deeplearn"></script>`);
}

module.exports = {
  NeuralNetwork,
};
