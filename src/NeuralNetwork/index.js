/*
Simple Artificial Neural Network
Based on https://github.com/shiffman/Neural-Network-p5 by Daniel Shiffman 
Based on "Make Your Own Neural Network" by Tariq Rashid
https://github.com/makeyourownneuralnetwork/
*/

import { activationFunctions, derivatives } from './activationFunctions';
import { math, randomFloat, randomGaussian } from './../utils/index';
import { Array2D } from 'deeplearn';

class NeuralNetwork {
  constructor(inputnodes, hiddennodes, outputnodes, learning_rate = 0.1, activation = 'sigmoid') {
    this.inodes = inputnodes;
    this.hnodes = hiddennodes;
    this.onodes = outputnodes;

    this.wih = Array2D.randNormal([this.hnodes, this.inodes]);
    this.wih = Array2D.randNormal([this.onodes, this.hnodes]);

    this.activation = activationFunctions[activation];
    this.derivative = derivatives[activation];
  }
  // Adjust weights ever so slightly
  static mutate(x) {
    if (randomFloat() < 0.1) {
      let offset = randomGaussian() * 0.5;
      return x + offset;
    } else {
      return x;
    }
  }
}

export { NeuralNetwork };