/* eslint max-len: "off" */
/*
fast-style-transfer
Based on deeplearn.js demo: https://github.com/PAIR-code/deeplearnjs/tree/0608feadbd897bca6ec7abf3340515fe5f2de1c2/demos/fast-style-transfer
and https://github.com/reiinakano/fast-style-transfer-deeplearnjs by reiinakano
*/
import { Array3D, CheckpointLoader, ENV, Scalar } from 'deeplearn';

class TransformNet {
  constructor(callback, style, model) {
    this.ready = false;
    this.math = ENV.math;
    this.variableDictionary = {};
    this.timesScalar = Scalar.new(150);
    this.plusScalar = Scalar.new(255.0 / 2);
    this.epsilonScalar = Scalar.new(1e-3);
    this.style = style;
    this.loadCheckpoints(model).then(() => {
      this.ready = true;
      callback();
    });
  }

  /**
   * Loads necessary variables for SqueezeNet. Resolves the promise when the
   * variables have all been loaded.
   */
  async loadCheckpoints(path) {
    if (this.variableDictionary[this.style] == null) {
      const checkpointLoader = new CheckpointLoader(path);
      this.variableDictionary[this.style] = await checkpointLoader.getAllVariables();
      this.variables = this.variableDictionary[this.style];
    }
  }

  setStyle(style) {
    this.style = style;
  }

  /**
   * Infer through TransformNet, assumes variables have been loaded.
   * Original Tensorflow version of model can be found at
   * https://github.com/lengstrom/fast-style-transfer
   *
   * @param imgElement HTMLImageElement of input img
   * @return Array3D containing pixels of output img
   */
  predict(imgElement) {
    const self = this;
    function varName(varId) {
      let variableName;
      if (varId === 0) {
        variableName = 'Variable';
      } else {
        variableName = `Variable_${varId}`;
      }
      return variableName;
    }

    function instanceNorm(input, varId) {
      const [height, width, inDepth] = input.shape;
      const moments = self.math.moments(input, [0, 1]);
      const mu = moments.mean;
      const sigmaSq = moments.variance;
      const shift = self.variables[varName(varId)];
      const scale = self.variables[varName(varId + 1)];
      const epsilon = self.epsilonScalar;
      const normalized = self.math.divide(self.math.sub(input.asType('float32'), mu), self.math.sqrt(self.math.add(sigmaSq, epsilon)));
      const shifted = self.math.add(self.math.multiply(scale, normalized), shift);
      return shifted.as3D(height, width, inDepth);
    }

    function convLayer(input, strides, relu, varId) {
      const y = self.math.conv2d(input, self.variables[varName(varId)], null, [strides, strides], 'same');
      const y2 = instanceNorm(y, varId + 1);

      if (relu) {
        return self.math.relu(y2);
      }

      return y2;
    }

    function convTransposeLayer(input, numFilters, strides, varId) {
      const [height, width] = input.shape;
      const newRows = height * strides;
      const newCols = width * strides;
      const newShape = [newRows, newCols, numFilters];

      const y = self.math.conv2dTranspose(input, self.variables[varName(varId)], newShape, [strides, strides], 'same');
      const y2 = instanceNorm(y, varId + 1);
      const y3 = self.math.relu(y2);

      return y3;
    }

    function residualBlock(input, varId) {
      const conv1 = convLayer(input, 1, true, varId);
      const conv2 = convLayer(conv1, 1, false, varId + 3);
      return self.math.addStrict(conv2, input);
    }

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
