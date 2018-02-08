/* eslint max-len: "off" */
/*
Simple Artificial Neural Network, limited to 3 layers
Based on https://github.com/shiffman/Neural-Network-p5 by Daniel Shiffman
Based on "Make Your Own Neural Network" by Tariq Rashid
https://github.com/makeyourownneuralnetwork/
*/

import { ENV, Array2D, Scalar } from 'deeplearn';

class NeuralNetwork {
  constructor(input_nodes, hidden_nodes, output_nodes, learning_rate = 0.1) {
    this.math = ENV.math;
    this.input_nodes = input_nodes;
    this.hidden_nodes = hidden_nodes;
    this.output_nodes = output_nodes;

    this.weights_ih = Array2D.randNormal([this.hidden_nodes, this.input_nodes]);
    this.weights_ho = Array2D.randNormal([this.output_nodes, this.hidden_nodes]);

    this.bias_h = Array2D.randNormal([this.hidden_nodes, 1]);
    this.bias_o = Array2D.randNormal([this.output_nodes, 1]);

    this.learning_rate = Scalar.new(learning_rate);
  }
  
  
  train(inputsArray, targetsArray) {
    this.math.scope(async (keep) => {
      // convert inputs list to 2d array
      const inputs = this.math.transpose(Array2D.new([1, inputsArray.length], inputsArray));
      const targets = this.math.transpose(Array2D.new([1, targetsArray.length], targetsArray));

      // calculate signals into hidden layer
      const hidden = this.math.matMul(this.weights_ih, inputs);
      // Add bias
      const hidden_b = this.math.add(hidden, this.bias_h);
      // calculate the signals emerging from hidden layer
      const hidden_outputs = this.math.sigmoid(hidden_b);

      // calculate signals into final output layer
      const outputs = this.math.matMul(this.weights_ho, hidden_outputs);
      // add bias
      const outputs_b = this.math.add(outputs, this.bias_o);      
      // calculate signals emerging from final output layer
      const outputs_final = this.math.sigmoid(outputs_b);

      // output layer error is the (target - actual)
      const output_errors = this.math.subtract(targets, outputs_final);
      
      // hidden layer error is the outputErrors, split by weights, recombined at hidden node
      const who_t = this.math.transpose(this.weights_ho);
      const hidden_errors = this.math.matMul(who_t, output_errors);
            
      // Start Backpropagation
      // Update the weights for the links between the hidden and output layers
      
      // Sigmoid derivate
      let gradients = this.math.multiply(outputs_final, this.math.subtract(Scalar.new(1), outputs_final));
      // Hadamard errors
      gradients = this.math.multiply(gradients, output_errors);
      // Learning rate
      gradients = this.math.multiply(this.learning_rate, gradients);
      
      // Calculate deltas
      const hidden_T = this.math.transpose(hidden_outputs);
      const weight_ho_deltas = this.math.matMul(gradients, hidden_T);
      
      // Change weights and bias
      this.weights_ho = await keep(this.math.add(this.weights_ho, weight_ho_deltas));
      this.bias_o = await keep(this.math.add(this.bias_o, gradients));

      // Update the weights for the links between the input and hidden layers
      
      // Sigmoid derivative
      let hidden_gradient = this.math.multiply(hidden_outputs, this.math.subtract(Scalar.new(1), hidden_outputs));
      hidden_gradient = this.math.multiply(hidden_gradient, hidden_errors);
      hidden_gradient = this.math.multiply(this.learning_rate, hidden_gradient);

      // Calcuate input -> hidden deltas
      //const hidden_T = this.math.transpose(hidden_outputs);
      const weight_ho_deltas = this.math.matMul(gradients, hidden_T);

      const inputs_T = Matrix.transpose(inputs);
      const weight_ih_deltas = this.math.matMul(hidden_gradient, inputs_T);

      this.weights_ih = await keep(this.math.add(this.weights_ih, weight_ih_deltas));
      // Adjust the bias by its deltas (which is just the gradients)
      this.bias_h = await keep(this.math.add(this.bias_h, hidden_gradient));
    });
  }

  predict(inputsArray) {
    return this.math.scope(() => {
      // convert inputs list to 2d array
      const inputs = this.math.transpose(Array2D.new([1, inputsArray.length], inputsArray));

      // Calculate signals into hidden layer
      const hiddenInputs = this.math.matMul(this.wih, inputs);
      // // Calculate the signals emerging from the hidden layer
      const hiddenOutputs = this.math.sigmoid(hiddenInputs);

      // // Calculate signals into final output layer
      const finalInputs = this.math.matMul(this.who, hiddenOutputs);
      const finalOutputs = this.math.sigmoid(finalInputs);
      const argMax = this.math.argMax(finalOutputs).getValues()[0];
      const results = finalOutputs.getValues();
      return {
        argMax,
        results: Array.from(results),
      };
    });
  }
}

export default NeuralNetwork;
