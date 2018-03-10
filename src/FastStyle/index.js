/* eslint max-len: "off" */
/*
Fast Style Transfer
*/

import * as dl from 'deeplearn';
import { array3DToImage } from '../utils/imageUtilities';

class FastStyle {
  constructor(model, callback) {
    this.ready = false;
    this.variableDictionary = {};
    this.timesScalar = dl.tensor(150);
    this.plusScalar = dl.tensor(255.0 / 2);
    this.epsilonScalar = dl.tensor(1e-3);
    this.loadCheckpoints(model).then(() => {
      this.ready = true;
      callback();
    });
  }
  async loadCheckpoints(path) {
    const checkpointLoader = new dl.CheckpointLoader(path);
    this.variables = await checkpointLoader.getAllVariables();
  }

  instanceNorm(input, id) {
    const [height, width, inDepth] = input.shape;
    const moments = dl.moments(input, [0, 1]);
    const mu = moments.mean;
    const sigmaSq = moments.variance;
    const shift = this.variables[FastStyle.getVariableName(id)];
    const scale = this.variables[FastStyle.getVariableName(id + 1)];
    const epsilon = this.epsilonScalar;
    const normalized = dl.div(dl.sub(input.asType('float32'), mu), dl.sqrt(dl.add(sigmaSq, epsilon)));
    const shifted = dl.add(dl.mul(scale, normalized), shift);
    return shifted.as3D(height, width, inDepth);
  }

  convLayer(input, strides, relu, id) {
    const y = dl.conv2d(input, this.variables[FastStyle.getVariableName(id)], [strides, strides], 'same');
    const y2 = this.instanceNorm(y, id + 1);
    if (relu) {
      return dl.relu(y2);
    }
    return y2;
  }

  residualBlock(input, id) {
    const conv1 = this.convLayer(input, 1, true, id);
    const conv2 = this.convLayer(conv1, 1, false, id + 3);
    return dl.add(conv2, input);
  }

  convTransposeLayer(input, numFilters, strides, id) {
    const [height, width] = input.shape;
    const newRows = height * strides;
    const newCols = width * strides;
    const newShape = [newRows, newCols, numFilters];
    const y = dl.conv2dTranspose(input, this.variables[FastStyle.getVariableName(id)], newShape, [strides, strides], 'same');
    const y2 = this.instanceNorm(y, id + 1);
    const y3 = dl.relu(y2);
    return y3;
  }

  transfer(input) {
    const image = dl.fromPixels(input);
    const result = dl.tidy(() => {
      const conv1 = this.convLayer(image, 1, true, 0);
      const conv2 = this.convLayer(conv1, 2, true, 3);
      const conv3 = this.convLayer(conv2, 2, true, 6);
      const res1 = this.residualBlock(conv3, 9);
      const res2 = this.residualBlock(res1, 15);
      const res3 = this.residualBlock(res2, 21);
      const res4 = this.residualBlock(res3, 27);
      const res5 = this.residualBlock(res4, 33);
      const convT1 = this.convTransposeLayer(res5, 64, 2, 39);
      const convT2 = this.convTransposeLayer(convT1, 32, 2, 42);
      const convT3 = this.convLayer(convT2, 1, false, 45);
      const outTanh = dl.tanh(convT3);
      const scaled = dl.mul(this.timesScalar, outTanh);
      const shifted = dl.add(this.plusScalar, scaled);
      const clamped = dl.clipByValue(shifted, 0, 255);
      const normalized = dl.div(clamped, dl.tensor(255.0));
      return normalized;
    });
    return array3DToImage(result);
  }

  // Static Methods
  static getVariableName(id) {
    if (id === 0) {
      return 'Variable';
    }
    return `Variable_${id}`;
  }
}

export default FastStyle;
