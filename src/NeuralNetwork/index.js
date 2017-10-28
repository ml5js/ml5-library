/*
Simple Artificial Neural Network
Based on https://github.com/shiffman/Neural-Network-p5 by Daniel Shiffman 
Based on "Make Your Own Neural Network" by Tariq Rashid
https://github.com/makeyourownneuralnetwork/
*/

import { activationFunctions, derivatives } from './activationFunctions';
import { math, randomFloat, randomGaussian } from './../utils/index';
import { Array1D, Array2D } from 'deeplearn';

class NeuralNetwork {
  constructor(inputnodes, hiddennodes, outputnodes, learning_rate = 0.1, activation = 'sigmoid') {
    // Number of nodes in layer (input, hidden, output)
    // This network is limited to 3 layers
    this.inodes = inputnodes;
    this.hnodes = hiddennodes;
    this.onodes = outputnodes;

    this.wih = Array2D.randNormal([this.hnodes, this.inodes]);
    this.who = Array2D.randNormal([this.onodes, this.hnodes]);

    this.activation = activationFunctions[activation];
    this.derivative = derivatives[activation];

    this.learning_rate = learning_rate;
    this.train([2, 3, 4], [4, 6, 8]);
  }

  train(inputs_array, targets_array) {
    // convert inputs list to 2d array
    let inputs = math.transpose(Array2D.new([1, inputs_array.length], inputs_array))
    let targets = math.transpose(Array2D.new([1, targets_array.length], targets_array))

    // calculate signals into hidden layer
    let hidden_inputs = math.matMul(this.wih, inputs);
    // calculate the signals emerging from hidden layer
    let hidden_outputs = math.sigmoid(hidden_inputs);

    // calculate signals into final output layer
    let final_inputs = math.matMul(this.who, hidden_outputs);
    // calculate signals emerging from final output layer
    let final_outputs = math.sigmoid(final_inputs)

    // output layer error is the (target - actual)
    let output_errors = math.subtract(targets, final_outputs);
    // hidden layer error is the output_errors, split by weights, recombined at hidden node
    let hidden_errors = math.matMul(math.transpose(this.who), output_errors)
  
    // Update the weights for the links between the hidden and output layers
    this.who = this.learning_rate * math.matMul(math.matMul(math.matMul(output_errors, final_outputs), math.subtract(1, final_outputs)),math.transpose(hidden_outputs));


  }

  query(inputsArray) {

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