/*
Simple Artificial Neural Network
Based on https://github.com/shiffman/Neural-Network-p5 by Daniel Shiffman 
Based on "Make Your Own Neural Network" by Tariq Rashid
https://github.com/makeyourownneuralnetwork/
*/

import { math, randomFloat, randomGaussian } from './../utils/index';
import { Array1D, Array2D, Scalar } from 'deeplearn';
import { MatrixOrientation } from 'deeplearn/dist/src/math/math';

class NeuralNetwork {
  constructor(inputnodes, hiddennodes, outputnodes, learning_rate = 0.1, activation = 'sigmoid') {
    // Number of nodes in layer (input, hidden, output)
    // This network is limited to 3 layers
    this.inodes = inputnodes;
    this.hnodes = hiddennodes;
    this.onodes = outputnodes;

    this.wih = Array2D.randNormal([this.hnodes, this.inodes]);
    this.who = Array2D.randNormal([this.onodes, this.hnodes]);
    this.learning_rate = Scalar.new(learning_rate);

  }

  train(inputs_array, targets_array) {
    math.scope((keep, track) => {
      // convert inputs list to 2d array
      const inputs = track(math.transpose(Array2D.new([1, inputs_array.length], inputs_array)));
      const targets = track(math.transpose(Array2D.new([1, targets_array.length], targets_array)));

      // calculate signals into hidden layer
      const hidden_inputs = track((math.matMul(this.wih, inputs)));
      // calculate the signals emerging from hidden layer
      const hidden_outputs = track(math.sigmoid(hidden_inputs));

      // calculate signals into final output layer
      const final_inputs = track(math.matMul(this.who, hidden_outputs));
      // calculate signals emerging from final output layer
      const final_outputs = track(math.sigmoid(final_inputs));

      // output layer error is the (target - actual)
      const output_errors = track(math.subtract(targets, final_outputs));
      // hidden layer error is the output_errors, split by weights, recombined at hidden node
      const hidden_errors = track(math.matMul(math.transpose(this.who), output_errors));
      // Start Backpropagation
      // Update the weights for the links between the hidden and output layers  
      this.who = keep(math.add(this.who, math.multiply(this.learning_rate, math.matMul(math.multiply(math.multiply(output_errors, final_outputs), math.subtract(Scalar.new(1), final_outputs)), math.transpose(hidden_outputs)))));

      // Update the weights for the links between the input and the hidden layer
      this.wih = keep(math.add(this.wih, math.multiply(this.learning_rate, math.matMul(math.multiply(math.multiply(hidden_errors, hidden_outputs), math.subtract(Scalar.new(1), hidden_outputs)), math.transpose(inputs)))));
    });
  }

  query(inputs_array) {
    let result;
    math.scope((keep, track) => {
      // convert inputs list to 2d array
      const inputs = track(math.transpose(Array2D.new([1, inputs_array.length], inputs_array)));

      // Calculate signals into hidden layer
      const hidden_inputs = track(math.matMul(this.wih, inputs));
      // Calculate the signals emerging from the hidden layer
      const hidden_outputs = track(math.sigmoid(hidden_inputs));

      // Calculate signals into final output layer
      const final_inputs = track(math.matMul(this.who, hidden_outputs));
      const final_outputs = track(math.sigmoid(final_inputs));
      result = {
        argMax: math.argMax(final_outputs).getValues()[0],
        result: Array.from(final_outputs.getValues())
      };
    });
    return result;
  }
}

export { NeuralNetwork };