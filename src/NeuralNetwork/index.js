/* eslint max-len: "off" */
/*
Simple Artificial Neural Network, limited to 3 layers
Based on https://github.com/shiffman/Neural-Network-p5 by Daniel Shiffman
Based on "Make Your Own Neural Network" by Tariq Rashid
https://github.com/makeyourownneuralnetwork/
*/

import { ENV, Array2D, Scalar } from 'deeplearn';

class NeuralNetwork {
  constructor(inputNodes, hiddenNodes, outputNodes, learningRate = 0.1) {
    this.math = ENV.math;
    this.iNodes = inputNodes;
    this.hNodes = hiddenNodes;
    this.oNodes = outputNodes;

    this.wih = Array2D.randNormal([this.hNodes, this.iNodes]);
    this.who = Array2D.randNormal([this.oNodes, this.hNodes]);
    this.learningRate = Scalar.new(learningRate);
  }

  train(inputsArray, targetsArray) {
    this.math.scope(async (keep) => {
      // convert inputs list to 2d array
      const inputs = this.math.transpose(Array2D.new([1, inputsArray.length], inputsArray));
      const targets = this.math.transpose(Array2D.new([1, targetsArray.length], targetsArray));

      // calculate signals into hidden layer
      const hiddenInputs = this.math.matMul(this.wih, inputs);
      // calculate the signals emerging from hidden layer
      const hiddenOutputs = this.math.sigmoid(hiddenInputs);

      // calculate signals into final output layer
      const finalInputs = this.math.matMul(this.who, hiddenOutputs);
      // calculate signals emerging from final output layer
      const finalOutputs = this.math.sigmoid(finalInputs);

      // output layer error is the (target - actual)
      const outputErrors = this.math.subtract(targets, finalOutputs);
      // hidden layer error is the outputErrors, split by weights, recombined at hidden node
      const hiddenErrors = this.math.matMul(this.math.transpose(this.who), outputErrors);
      // Start Backpropagation
      // Update the weights for the links between the hidden and output layers
      this.who = await keep(this.math.add(this.who, this.math.multiply(this.learningRate, this.math.matMul(this.math.multiply(this.math.multiply(outputErrors, finalOutputs), this.math.subtract(Scalar.new(1), finalOutputs)), this.math.transpose(hiddenOutputs)))));
      // Update the weights for the links between the input and the hidden layer
      this.wih = await keep(this.math.add(this.wih, this.math.multiply(this.learningRate, this.math.matMul(this.math.multiply(this.math.multiply(hiddenErrors, hiddenOutputs), this.math.subtract(Scalar.new(1), hiddenOutputs)), this.math.transpose(inputs)))));
    });
  }

  query(inputsArray) {
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
