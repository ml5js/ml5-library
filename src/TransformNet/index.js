/* eslint max-len: "off" */
/*
fast-style-transfer
*/

import { Array3D, CheckpointLoader, ENV, Scalar } from 'deeplearn';

class TransformNet {
  constructor(model, callback) {
    this.ready = false;
    this.math = ENV.math;
    this.variableDictionary = {};
    this.timesScalar = Scalar.new(150);
    this.plusScalar = Scalar.new(255.0 / 2);
    this.epsilonScalar = Scalar.new(1e-3);
    this.loadCheckpoints(model).then(() => {
      this.ready = true;
      callback();
    });
  }
  async loadCheckpoints(path) {
    const checkpointLoader = new CheckpointLoader(path);
    this.variables = await checkpointLoader.getAllVariables();
  }

  predict(imgElement) {
    const varName = (varId) => {
      let variableName;
      if (varId === 0) {
        variableName = 'Variable';
      } else {
        variableName = `Variable_${varId}`;
      }
      return variableName;
    };

    const instanceNorm = (input, varId) => {
      const [height, width, inDepth] = input.shape;
      const moments = this.math.moments(input, [0, 1]);
      const mu = moments.mean;
      const sigmaSq = moments.variance;
      const shift = this.variables[varName(varId)];
      const scale = this.variables[varName(varId + 1)];
      const epsilon = this.epsilonScalar;
      const normalized = this.math.divide(this.math.sub(input.asType('float32'), mu), this.math.sqrt(this.math.add(sigmaSq, epsilon)));
      const shifted = this.math.add(this.math.multiply(scale, normalized), shift);
      return shifted.as3D(height, width, inDepth);
    };

    const convLayer = (input, strides, relu, varId) => {
      const y = this.math.conv2d(input, this.variables[varName(varId)], null, [strides, strides], 'same');
      const y2 = instanceNorm(y, varId + 1);

      if (relu) {
        return this.math.relu(y2);
      }

      return y2;
    };

    const convTransposeLayer = (input, numFilters, strides, varId) => {
      const [height, width] = input.shape;
      const newRows = height * strides;
      const newCols = width * strides;
      const newShape = [newRows, newCols, numFilters];

      const y = this.math.conv2dTranspose(input, this.variables[varName(varId)], newShape, [strides, strides], 'same');
      const y2 = instanceNorm(y, varId + 1);
      const y3 = this.math.relu(y2);

      return y3;
    };

    const residualBlock = (input, varId) => {
      const conv1 = convLayer(input, 1, true, varId);
      const conv2 = convLayer(conv1, 1, false, varId + 3);
      return this.math.addStrict(conv2, input);
    };

    const preprocessedInput = Array3D.fromPixels(imgElement);
    const img = this.math.scope(() => {
      const conv1 = convLayer(preprocessedInput, 1, true, 0);
      const conv2 = convLayer(conv1, 2, true, 3);
      const conv3 = convLayer(conv2, 2, true, 6);
      const resid1 = residualBlock(conv3, 9);
      const resid2 = residualBlock(resid1, 15);
      const resid3 = residualBlock(resid2, 21);
      const resid4 = residualBlock(resid3, 27);
      const resid5 = residualBlock(resid4, 33);
      const convT1 = convTransposeLayer(resid5, 64, 2, 39);
      const convT2 = convTransposeLayer(convT1, 32, 2, 42);
      const convT3 = convLayer(convT2, 1, false, 45);
      const outTanh = this.math.tanh(convT3);
      const scaled = this.math.scalarTimesArray(this.timesScalar, outTanh);
      const shifted = this.math.scalarPlusArray(this.plusScalar, scaled);
      const clamped = this.math.clip(shifted, 0, 255);
      const normalized = this.math.divide(clamped, Scalar.new(255.0));

      return normalized;
    });
    return img;
  }
}

export default TransformNet;
