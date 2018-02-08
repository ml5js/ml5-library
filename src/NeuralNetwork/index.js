/* eslint max-len: "off" */
/*
Simple Artificial Neural Network, limited to 3 layers
Based on https://github.com/CodingTrain/Toy-Neural-Network-JS/ by Daniel Shiffman
Based on "Make Your Own Neural Network" by Tariq Rashid
https://github.com/makeyourownneuralnetwork/
*/

import { ENV, Array2D, Scalar } from 'deeplearn';

class NeuralNetwork {
  constructor(inputNodes, hiddenNodes, outputNodes, learningRate = 0.1) {
    this.math = ENV.math;
    this.inputNodes = inputNodes;
    this.hiddenNodes = hiddenNodes;
    this.outputNodes = outputNodes;

    this.weightsIH = Array2D.randNormal([this.hiddenNodes, this.inputNodes]);
    this.weightsHO = Array2D.randNormal([this.outputNodes, this.hiddenNodes]);

    this.biasH = Array2D.randNormal([this.hiddenNodes, 1]);
    this.biasO = Array2D.randNormal([this.outputNodes, 1]);

    this.learningRate = Scalar.new(learningRate);
  }

  train(inputsArray, targetsArray) {
    this.math.scope(async (keep) => {
      // convert inputs list to 2d array
      const inputs = this.math.transpose(Array2D.new([1, inputsArray.length], inputsArray));
      const targets = this.math.transpose(Array2D.new([1, targetsArray.length], targetsArray));

      // calculate signals into hidden layer
      const hidden = this.math.matMul(this.weightsIH, inputs);
      // Add bias
      const hiddenB = this.math.add(hidden, this.biasH);
      // calculate the signals emerging from hidden layer
      const hiddenOutputs = this.math.sigmoid(hiddenB);

      // calculate signals into final output layer
      const outputs = this.math.matMul(this.weightsHO, hiddenOutputs);
      // add bias
      const outputsB = this.math.add(outputs, this.biasO);
      // calculate signals emerging from final output layer
      const outputsFinal = this.math.sigmoid(outputsB);

      // output layer error is the (target - actual)
      const outputErrors = this.math.subtract(targets, outputsFinal);

      // hidden layer error is the outputErrors, split by weights, recombined at hidden node
      const whoT = this.math.transpose(this.weightsHO);
      const hiddenErrors = this.math.matMul(whoT, outputErrors);

      // Start Backpropagation
      // Update the weights for the links between the hidden and output layers

      // Sigmoid derivative
      let gradients = this.math.multiply(outputsFinal, this.math.subtract(Scalar.new(1), outputsFinal));
      // Hadamard errors
      gradients = this.math.multiply(gradients, outputErrors);
      // Learning rate
      gradients = this.math.multiply(gradients, this.learningRate);

      // Calculate hidden -> output deltas
      const hiddenT = this.math.transpose(hiddenOutputs);
      const deltaHOs = this.math.matMul(gradients, hiddenT);

      // Change weights and bias
      this.weightsHO = await keep(this.math.add(this.weightsHO, deltaHOs));
      this.biasO = await keep(this.math.add(this.biasO, gradients));

      // Update the weights for the links between the input and hidden layers

      // Sigmoid derivative
      let hiddenGradient = this.math.multiply(hiddenOutputs, this.math.subtract(Scalar.new(1), hiddenOutputs));
      hiddenGradient = this.math.multiply(hiddenGradient, hiddenErrors);
      hiddenGradient = this.math.multiply(this.learningRate, hiddenGradient);

      // Calcuate input -> hidden deltas
      const inputsT = this.math.transpose(inputs);
      const deltaIHs = this.math.matMul(hiddenGradient, inputsT);

      this.weightsIH = await keep(this.math.add(this.weightsIH, deltaIHs));
      // Adjust the bias by its deltas (which is just the gradients)
      this.biasH = await keep(this.math.add(this.biasH, hiddenGradient));
    });
  }


  predict(inputsArray) {
    return this.math.scope(() => {
      // convert inputs list to 2d array
      const inputs = this.math.transpose(Array2D.new([1, inputsArray.length], inputsArray));

      // Calculate signals into hidden layer
      const hidden = this.math.matMul(this.weightsIH, inputs);
      // Add bias
      const hiddenB = this.math.add(hidden, this.biasH);
      // // Calculate the signals emerging from the hidden layer
      const hiddenOutputs = this.math.sigmoid(hiddenB);

      // // Calculate signals into final output layer
      const finalInputs = this.math.matMul(this.weightsHO, hiddenOutputs);
      const finalInputsB = this.math.add(finalInputs, this.biasO);
      const finalOutputs = this.math.sigmoid(finalInputsB);
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
