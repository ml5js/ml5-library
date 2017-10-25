/*
HighML v.0.0.1

HighML is a high level javascript library for machine learning.
Made @ NYU ITP

*/

'use strict';

import { NeuralNetwork } from './NeuralNetwork/index';

// Check if deeplearn.js is imported
if(window.deeplearn){
  console.log('HighML loaded!');
} else {
  console.error(`You need to import deeplearn.js!
  Add this to your html page <script src="https://unpkg.com/deeplearn"></script>`);
}

module.exports = {
  NeuralNetwork,
};
