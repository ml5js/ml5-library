// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Heavily derived from YAD2K (https://github.com/allanzelener/YAD2K)
/* eslint max-len: ["error", { "code": 180 }] */

import * as tf from '@tensorflow/tfjs';

// export const ANCHORS = tf.tensor2d([
//   [0.57273, 0.677385],
//   [1.87446, 2.06253],
//   [3.33843, 5.47434],
//   [7.88282, 3.52778],
//   [9.77052, 9.16828],
// ]);

export const boxIntersection = (a, b) => {
  const w = Math.min(a[3], b[3]) - Math.max(a[1], b[1]);
  const h = Math.min(a[2], b[2]) - Math.max(a[0], b[0]);
  if (w < 0 || h < 0) {
    return 0;
  }
  return w * h;
};

export const boxUnion = (a, b) => {
  const i = boxIntersection(a, b);
  return (((a[3] - a[1]) * (a[2] - a[0])) + ((b[3] - b[1]) * (b[2] - b[0]))) - i;
};

export const boxIOU = (a, b) => boxIntersection(a, b) / boxUnion(a, b);

export async function filterBoxes(
  boxes,
  boxConfidence,
  boxClassProbs,
  threshold,
) {

  return tf.tidy(() => {

    const boxScores = tf.mul(boxConfidence, boxClassProbs);
    const boxClasses = tf.argMax(boxScores, -1);
    const boxClassScores = tf.max(boxScores, -1);

    const predictionMask = tf.greaterEqual(boxClassScores, tf.scalar(threshold));

    const maskArr = predictionMask.dataSync();

    const indicesArr = [];
    for (let i = 0; i < maskArr.length; i += 1) {
      const v = maskArr[i];
      if (v) {
        indicesArr.push(i);
      }
    }

    if (indicesArr.length === 0) {
      return [null, null, null];
    }

    const indices = tf.tensor1d(indicesArr, 'int32');

    const result = [
      tf.gather(boxes.reshape([maskArr.length, 4]), indices),
      tf.gather(boxClassScores.flatten(), indices),
      tf.gather(boxClasses.flatten(), indices),
    ];

    // boxes.dispose();
    // boxClassScores.dispose();
    // boxClasses.dispose();

    return result;
  })
}

export const boxesToCorners = (boxXY, boxWH) => {
  return tf.tidy(() => {
    const two = tf.tensor1d([2.0]);
    const boxMins = tf.sub(boxXY, tf.div(boxWH, two));
    const boxMaxes = tf.add(boxXY, tf.div(boxWH, two));

    const dim0 = boxMins.shape[0];
    const dim1 = boxMins.shape[1];
    const dim2 = boxMins.shape[2];
    const size = [dim0, dim1, dim2, 1];

    return tf.concat([
      boxMins.slice([0, 0, 0, 1], size),
      boxMins.slice([0, 0, 0, 0], size),
      boxMaxes.slice([0, 0, 0, 1], size),
      boxMaxes.slice([0, 0, 0, 0], size),
    ], 3);
  })
};

export const nonMaxSuppression = (boxes, scores, iouThreshold) => {
  return tf.tidy(() => {
    // Zip together scores, box corners, and index
    const zipped = [];
    for (let i = 0; i < scores.length; i += 1) {
      zipped.push([
        scores[i],
        [boxes[4 * i], boxes[(4 * i) + 1], boxes[(4 * i) + 2], boxes[(4 * i) + 3]], i,
      ]);
    }
    const sortedBoxes = zipped.sort((a, b) => b[0] - a[0]);
    const selectedBoxes = [];

    sortedBoxes.forEach((box) => {
      let add = true;
      for (let i = 0; i < selectedBoxes.length; i += 1) {
        const curIOU = boxIOU(box[1], selectedBoxes[i][1]);
        if (curIOU > iouThreshold) {
          add = false;
          break;
        }
      }
      if (add) {
        selectedBoxes.push(box);
      }
    });

    return [
      selectedBoxes.map(e => e[2]),
      selectedBoxes.map(e => e[1]),
      selectedBoxes.map(e => e[0]),
    ];
  })
};

// Convert yolo output to bounding box + prob tensors
/* eslint no-param-reassign: 0 */
export function head(feats, anchors, numClasses) {
  return tf.tidy(() => {
    const numAnchors = anchors.shape[0];

    const anchorsTensor = tf.reshape(anchors, [1, 1, numAnchors, 2]);

    let convDims = feats.shape.slice(1, 3);

    // For later use
    const convDims0 = convDims[0];
    const convDims1 = convDims[1];

    let convHeightIndex = tf.range(0, convDims[0]);
    let convWidthIndex = tf.range(0, convDims[1]);
    convHeightIndex = tf.tile(convHeightIndex, [convDims[1]]);

    convWidthIndex = tf.tile(tf.expandDims(convWidthIndex, 0), [convDims[0], 1]);
    convWidthIndex = tf.transpose(convWidthIndex).flatten();

    let convIndex = tf.transpose(tf.stack([convHeightIndex, convWidthIndex]));
    convIndex = tf.reshape(convIndex, [convDims[0], convDims[1], 1, 2]);
    convIndex = tf.cast(convIndex, feats.dtype);

    feats = tf.reshape(feats, [convDims[0], convDims[1], numAnchors, numClasses + 5]);
    convDims = tf.cast(tf.reshape(tf.tensor1d(convDims), [1, 1, 1, 2]), feats.dtype);

    let boxXY = tf.sigmoid(feats.slice([0, 0, 0, 0], [convDims0, convDims1, numAnchors, 2]));
    let boxWH = tf.exp(feats.slice([0, 0, 0, 2], [convDims0, convDims1, numAnchors, 2]));
    const boxConfidence = tf.sigmoid(feats.slice([0, 0, 0, 4], [convDims0, convDims1, numAnchors, 1]));
    const boxClassProbs = tf.softmax(feats.slice([0, 0, 0, 5], [convDims0, convDims1, numAnchors, numClasses]));

    boxXY = tf.div(tf.add(boxXY, convIndex), convDims);
    boxWH = tf.div(tf.mul(boxWH, anchorsTensor), convDims);

    return [boxXY, boxWH, boxConfidence, boxClassProbs];
  })
}