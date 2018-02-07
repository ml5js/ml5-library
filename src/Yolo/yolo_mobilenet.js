/* eslint-disable */
var __awaiter = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
  return new(P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }

    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }

    function step(result) { result.done ? resolve(result.value) : new P(function(resolve) { resolve(result.value); }).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
// tslint:disable-next-line:max-line-length
import { CheckpointLoader, Scalar } from 'deeplearn';
import { BoundingBox } from './mobilenet_utils';
const GOOGLE_CLOUD_STORAGE_DIR = 'https://storage.googleapis.com/learnjs-data/checkpoint_zoo/';
export class YoloMobileNetDetection {
  constructor(math) {
    this.math = math;
    // yolo variables
    this.PREPROCESS_DIVISOR = Scalar.new(255.0 / 2);
    this.ONE = Scalar.new(1);
    this.THRESHOLD = 0.3;
    this.THRESHOLD_SCALAR = Scalar.new(this.THRESHOLD);
    this.ANCHORS = [
      0.57273, 0.677385, 1.87446, 2.06253, 3.33843, 5.47434, 7.88282, 3.52778,
      9.77052, 9.16828
    ];
  }
  /**
   * Loads necessary variables for MobileNet.
   */
  load() {
    return __awaiter(this, void 0, void 0, function*() {
      const checkpointLoader = new CheckpointLoader(GOOGLE_CLOUD_STORAGE_DIR + 'yolo_mobilenet_v1_1.0_416/');
      this.variables = yield checkpointLoader.getAllVariables();
    });
  }
  /**
   * Infer through MobileNet, assumes variables have been loaded. This does
   * standard ImageNet pre-processing before inferring through the model. This
   * method returns named activations as well as pre-softmax logits.
   *
   * @param input un-preprocessed input Array.
   * @return Named activations and the pre-softmax logits.
   */
  predict(input) {
    // Keep a map of named activations for rendering purposes.
    const netout = this.math.scope((keep) => {
      // Preprocess the input.
      const preprocessedInput = this.math.subtract(this.math.arrayDividedByScalar(input, this.PREPROCESS_DIVISOR), this.ONE);
      const x1 = this.convBlock(preprocessedInput, [2, 2]);
      const x2 = this.depthwiseConvBlock(x1, [1, 1], 1);
      const x3 = this.depthwiseConvBlock(x2, [2, 2], 2);
      const x4 = this.depthwiseConvBlock(x3, [1, 1], 3);
      const x5 = this.depthwiseConvBlock(x4, [2, 2], 4);
      const x6 = this.depthwiseConvBlock(x5, [1, 1], 5);
      const x7 = this.depthwiseConvBlock(x6, [2, 2], 6);
      const x8 = this.depthwiseConvBlock(x7, [1, 1], 7);
      const x9 = this.depthwiseConvBlock(x8, [1, 1], 8);
      const x10 = this.depthwiseConvBlock(x9, [1, 1], 9);
      const x11 = this.depthwiseConvBlock(x10, [1, 1], 10);
      const x12 = this.depthwiseConvBlock(x11, [1, 1], 11);
      const x13 = this.depthwiseConvBlock(x12, [2, 2], 12);
      const x14 = this.depthwiseConvBlock(x13, [1, 1], 13);
      const x15 = this.math.conv2d(x14, this.variables['conv_23/kernel'], this.variables['conv_23/bias'], [1, 1], 'same');
      return x15.as4D(13, 13, 5, 6);
    });
    return netout;
  }
  convBlock(inputs, strides) {
    const x1 = this.math.conv2d(inputs, this.variables['conv1/kernel'], null, // this convolutional layer does not use bias
      strides, 'same');
    const x2 = this.math.batchNormalization3D(x1, this.variables['conv1_bn/moving_mean'], this.variables['conv1_bn/moving_variance'], .001, this.variables['conv1_bn/gamma'], this.variables['conv1_bn/beta']);
    return this.math.clip(x2, 0, 6); // simple implementation of Relu6
  }
  depthwiseConvBlock(inputs, strides, blockID) {
    const dwPadding = 'conv_dw_' + String(blockID) + '';
    const pwPadding = 'conv_pw_' + String(blockID) + '';
    const x1 = this.math.depthwiseConv2D(inputs, this.variables[dwPadding + '/depthwise_kernel'], strides, 'same');
    const x2 = this.math.batchNormalization3D(x1, this.variables[dwPadding + '_bn/moving_mean'], this.variables[dwPadding + '_bn/moving_variance'], .001, this.variables[dwPadding + '_bn/gamma'], this.variables[dwPadding + '_bn/beta']);
    const x3 = this.math.clip(x2, 0, 6);
    const x4 = this.math.conv2d(x3, this.variables[pwPadding + '/kernel'], null, // this convolutional layer does not use bias
      [1, 1], 'same');
    const x5 = this.math.batchNormalization3D(x4, this.variables[pwPadding + '_bn/moving_mean'], this.variables[pwPadding + '_bn/moving_variance'], .001, this.variables[pwPadding + '_bn/gamma'], this.variables[pwPadding + '_bn/beta']);
    return this.math.clip(x5, 0, 6);
  }
  interpretNetout(netout) {
    return __awaiter(this, void 0, void 0, function*() {
      // interpret the output by the network
      const GRID_H = netout.shape[0];
      const GRID_W = netout.shape[1];
      const BOX = netout.shape[2];
      const CLASS = netout.shape[3] - 5;
      const boxes = [];
      // adjust confidence predictions
      const confidence = this.math.sigmoid(this.math.slice4D(netout, [0, 0, 0, 4], [GRID_H, GRID_W, BOX, 1]));
      // adjust class prediction
      let classes = this.math.softmax(this.math.slice4D(netout, [0, 0, 0, 5], [GRID_H, GRID_W, BOX, CLASS]));
      classes = this.math.multiply(classes, confidence);
      const mask = this.math.step(this.math.relu(this.math.subtract(classes, this.THRESHOLD_SCALAR)));
      classes = this.math.multiply(classes, mask);
      const objectLikelihood = this.math.sum(classes, 3);
      const objectLikelihoodValues = yield objectLikelihood.data();
      for (let i = 0; i < objectLikelihoodValues.length; i++) {
        if (objectLikelihoodValues[i] > 0) {
          const [row, col, box] = objectLikelihood.indexToLoc(i);
          const conf = confidence.get(row, col, box, 0);
          const probs = yield this.math
            .slice4D(classes, [row, col, box, 0], [1, 1, 1, CLASS])
            .data();
          const xywh = yield this.math.slice4D(netout, [row, col, box, 0], [1, 1, 1, 4])
            .data();
          let x = xywh[0];
          let y = xywh[1];
          let w = xywh[2];
          let h = xywh[3];
          x = (col + this.sigmoid(x)) / GRID_W;
          y = (row + this.sigmoid(y)) / GRID_H;
          w = this.ANCHORS[2 * box + 0] * Math.exp(w) / GRID_W;
          h = this.ANCHORS[2 * box + 1] * Math.exp(h) / GRID_H;
          // console.log(i, objectLikelihoodValues[i], probs, conf);
          boxes.push(new BoundingBox(x, y, w, h, conf, probs, i));
        }
      }
      // suppress nonmaximal boxes
      for (let cls = 0; cls < CLASS; cls++) {
        const allProbs = boxes.map((box) => box.probs[cls]);
        const indices = new Array(allProbs.length);
        for (let i = 0; i < allProbs.length; ++i) {
          indices[i] = i;
        }
        indices.sort((a, b) => allProbs[a] > allProbs[b] ? 1 : 0);
        for (let i = 0; i < allProbs.length; i++) {
          const indexI = indices[i];
          if (boxes[indexI].probs[cls] === 0) {
            continue;
          } else {
            for (let j = i + 1; j < allProbs.length; j++) {
              const indexJ = indices[j];
              if (boxes[indexI].iou(boxes[indexJ]) > 0.4) {
                boxes[indexJ].probs[cls] = 0;
              }
            }
          }
        }
      }
      // obtain the most likely boxes
      const likelyBoxes = [];
      for (const box of boxes) {
        if (box.getMaxProb() > this.THRESHOLD) {
          likelyBoxes.push(box);
        }
      }
      return likelyBoxes;
    });
  }
  sigmoid(x) {
    return 1. / (1. + Math.exp(-x));
  }
  dispose() {
    for (const varName in this.variables) {
      this.variables[varName].dispose();
    }
  }
}