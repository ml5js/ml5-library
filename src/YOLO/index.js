// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
/* eslint max-len: ["error", { "code": 180 }] */
/* eslint class-methods-use-this: off */

import * as tf from '@tensorflow/tfjs';
import COCO_CLASSES from './../utils/COCO_CLASSES';
import callCallback from '../utils/callcallback';
import draw from './utils';

// this is a config for yolov2-tiny
const DEFAULTS = {
  // Model URL
  modelURL: 'https://raw.githubusercontent.com/ml5js/ml5-data-and-models/master/models/YOLO/model.json',
  // Model version : this is important as there is some post processing changes 'v2' ||'v3'
  version: 'v2',
  // this is the size of the model input image : we can lower this to gain more performance
  //  the ones that i found to be a good compromise between perf/accracy are 224, 256, 320
  modelSize: 416, // 128 , 160 , 192 , 224 , 256 , 288 , 320 , 352 , 384 , 416,

  // Intersection Over Union threshhold and Class probability threshold  we use this to filter the output of the neural net
  iouThreshold: 0.5,
  classProbThreshold: 0.5,

  // class labels
  labels: COCO_CLASSES,

  // more info see  Dimension priors : https://arxiv.org/pdf/1612.08242.pdf
  anchors: [
    [0.57273, 0.677385],
    [1.87446, 2.06253],
    [3.33843, 5.47434],
    [7.88282, 3.52778],
    [9.77052, 9.16828],
  ],
  // in yolo v3  the neural net  give 2 or more outputs(set of boxes) so this mask splits the anchors to groups
  // each corresponding to a spesific layer/output.
  // for example  the tiny yolo v2 outputs 1 output that has 13x13x5 boxes (if you use 416 as a model size)
  masks: [[0, 1, 2, 3, 4]],

  // this is just more customization options concerning the preprocessing  pahse
  preProcessingOptions: {
    // 'NearestNeighbor'  - this output a more accurate image but but take a bit longer
    // 'Bilinear' - this faster but scrifices image quality
    ResizeOption: 'Bilinear',
    AlignCorners: true,
  },
};

class YOLODetector {
  constructor(video, options, callback) {
    this.video = video;
    this.model = null;

    this.modelURL = options.modelURL;
    this.version = options.version;
    this.modelSize = options.modelSize;
    this.iouThreshold = options.iouThreshold;
    this.classProbThreshold = options.classProbThreshold;
    this.labels = options.labels;
    this.anchors = options.anchors;
    this.masks = options.masks;
    this.preProcessingOptions = options.preProcessingOptions;

    this.modelReady = false;
    this.isPredicting = false;

    // Load the model
    this.ready = callCallback(this.loadModel(), callback);
  }

  async loadModel() {
    this.model = await tf.loadModel(this.modelURL);
  }
  async cache() {
    const dummy = tf.zeros([this.modelSize, this.modelSize, 3]);
    await this.detectInternal(dummy);
    tf.dispose(dummy);
  }

  async detect(inputOrCallback, cb) {
    await this.ready;
    let imgToPredict;
    let callback;
    if (typeof inputOrCallback === 'function') {
      imgToPredict = this.video;
      callback = inputOrCallback;
    } else {
      imgToPredict = inputOrCallback;
      callback = cb;
    }
    return callCallback(this.detectInternal(imgToPredict), callback);
  }

  /**
   * Draw the detections on a `HTMLCanvasElement`
   * @param detections  detections to be drawn
   * @param canvas `HTMLCanvasElement` to draw to
   */
  draw(detections, canvas) {
    const ctx = canvas.getContext('2d');
    const lablesLen = this.labels.length;
    draw(detections, ctx, lablesLen);
  }

  /**
   * the main function that handles the infrence
   * @param image the input image;
   *
   * @return a `Detection[]` that contains:
   *``` javascript
   *      {
   *         label:string;
   *         labelIndex:number;
   *         score:number;
   *         x:number;
   *         y:number;
   *         w:number;
   *         h:number;
   *       }
   * ```
   */
  async detectInternal(image) {
    const results = tf.tidy(() => {
      const [imgWidth, imgHeight, imageTensor] = this.preProcess(image, this.modelSize, this.preProcessingOptions);
      const preds = this.model.predict(imageTensor, { batchSize: 1 });
      const [boxes, scores] = this.postProcessRawPrediction(preds);
      const scaledBoxes = this.rescaleBoxes(boxes, imgWidth, imgHeight);
      return [scaledBoxes, scores];
    });
    const filtered = await this.filterBoxesAsync(results[0], results[1], this.classProbThreshold);
    tf.dispose(results);
    const [boxArr, scoresArr, classesArr] = await Promise.all([filtered[0].data(), filtered[1].data(), filtered[2].data()]);
    tf.dispose(filtered);
    const rawBoxes = this.NonMaxSuppression(boxArr, scoresArr, classesArr, this.iouThreshold);
    const detections = this.createDetectionArray(rawBoxes);
    return detections;
  }

  // these are just synchronous version of the above methods
  async detectSync(image) {
    return this.detectInternalSync(image);
  }
  async detectInternalSync(image) {
    return tf.tidy(() => {
      const [imgWidth, imgHeight, imageTensor] = this.preProcess(image, this.modelSize, this.preProcessingOptions);
      const preds = this.model.predict(imageTensor, { batchSize: 1 });
      const [allBoxes, allScores] = this.postProcessRawPrediction(preds);
      const scaledBoxes = this.rescaleBoxes(allBoxes, imgWidth, imgHeight);
      const [boxes, scores, classes] = this.filterBoxes(scaledBoxes, allScores, this.classProbThreshold);
      const boxArr = boxes.dataSync();
      const scoresArr = scores.dataSync();
      const classesArr = classes.dataSync();
      tf.dispose([boxes, scores, classes]);
      const rawBoxes = this.NonMaxSuppression(boxArr, scoresArr, classesArr, this.iouThreshold);
      return this.createDetectionArray(rawBoxes);
    });
  }

  /**
   * Performs the pre processing ops for the yolo/darknet CNN
   *
   * @param input can be  `HTMLCanvasElement` || `HTMLVideoElement` || `ImageData` || `HTMLImageElement` || `Tensor`;
   * @param size model input size
   * @param options some options regarding image resizing
   *
   * @return  an array the image original width and height and the preprocessed image tensor
   *          original image Width as a `number`
   *          original image Height as a `number`
   *          a 4D tensor with the shape of `[1,size,size,3]`
   */
  preProcess(input, size, options) {
    return tf.tidy(() => {
      let image;
      if (input instanceof tf.Tensor) {
        image = input;
      } else if (input instanceof HTMLImageElement || input instanceof HTMLVideoElement || input instanceof ImageData || input instanceof HTMLCanvasElement) {
        image = tf.fromPixels(input);
      } else if (typeof img === 'object' && (image.elt instanceof HTMLImageElement || image.elt instanceof HTMLVideoElement)) {
        image = tf.fromPixels(image.elt); // Handle p5.js image and video.
      }
      const [imgWidth, imgHeight] = [image.shape[1], image.shape[0]];
      // Normalize the image from [0, 255] to [0, 1].
      const normalized = image.toFloat().div(tf.scalar(255));
      let resized = normalized;
      if (normalized.shape[0] !== size || normalized.shape[1] !== size) {
        const alignCorners = options.AlignCorners;
        if (options.ResizeOption === 'Bilinear') {
          resized = tf.image.resizeNearestNeighbor(normalized, [size, size], alignCorners);
        } else {
          resized = tf.image.resizeBilinear(normalized, [size, size], alignCorners);
        }
      }
      // Reshape to a single-element batch so we can pass it to predict.
      const batched = resized.reshape([1, size, size, 3]);
      return [imgWidth, imgHeight, batched];
    });
  }
  /**
   * the postprocessing function for the yolo object detection algorithm
   * @param rawPrediction can be a `tf.Tensor` representing a single output (yolov2)
   * or a `tf.Tensor[]` representing multiple outputs (yolov3 has 3 outputs ).
   * each output has the shape of `[size, size, (numClasses+5) * numAnchors]`
   * with the 5 representing : Box Coodinates [4] + BoxConfidence [1]
   *
   * @return a `tf.Tensor[]` that contain `[Boxes, Scores]`
   * `Boxes` with a shape of `[numBoxes, 4]`
   * Each `box` is defined by `[maxY, maxX, minY, minX]`
   * Score with a shape of `[numBoxes, numClasses]`
   */
  postProcessRawPrediction(rawPrediction) {
    const layers = [];
    if (this.isTensorOrTensorArray(rawPrediction)) {
      // its a single Tensor (v2)
      layers.push(rawPrediction);
    } else {
      rawPrediction.forEach(layer => layers.push(layer));
    }
    const boxes = [];
    const probs = [];
    for (let i = 0; i < layers.length; i += 1) {
      const mask = this.masks[i];
      const numAnchors = mask.length;
      const anchorsArr = [];
      for (let j = 0; j < numAnchors; j += 1) {
        anchorsArr.push(this.anchors[mask[j]]);
      }
      const anchorsTensor = tf.tensor(anchorsArr).reshape([1, 1, numAnchors, 2]);
      const classesLength = this.labels.length;
      // remove the batch dim
      const squeezed = layers[i].squeeze([0]);
      const [box, prob] = this.processLayer(squeezed, anchorsTensor, this.modelSize, classesLength, this.version);
      boxes.push(box);
      probs.push(prob);
    }
    const boxesTensor = tf.concat(boxes, 0);
    const probsTensor = tf.concat(probs, 0);
    return [boxesTensor, probsTensor];
  }

  /**
   * Process 1 layer of the yolo output
   * @param prediction a `tf.Tensor` representing 1 output of  the neural net
   * @param anchorsTensor a `tf.Tensor` representing the anchors that correspond with the output
   * shape : `[numAnchors, 2]`
   * @param modelSize the input size for the neural net
   * @param classesLen the number of classes/labels that the neural net predicts
   * @param version yolo version `v2` || `v3`
   *
   * @return a `tf.Tensor[]` that containes `[boxes , Scores]` that correspond to the specific layer
   */
  processLayer(prediction, anchorsTensor, modelSize, classesLen, version) {
    const [outputWidth, outputHeight] = [prediction.shape[0], prediction.shape[1]];
    const anchorsLen = anchorsTensor.shape[2];
    const numBoxes = outputWidth * outputHeight * anchorsLen;
    // classesLen + 5 =  classesLen + x + y + w + h + obj_score
    const reshaped = tf.reshape(prediction, [outputWidth, outputHeight, anchorsLen, classesLen + 5]);
    let boxxy = tf.sigmoid(reshaped.slice([0, 0, 0, 0], [outputWidth, outputHeight, anchorsLen, 2]));
    let boxwh = tf.exp(reshaped.slice([0, 0, 0, 2], [outputWidth, outputHeight, anchorsLen, 2]));
    const boxConfidence = tf.sigmoid(reshaped.slice([0, 0, 0, 4], [outputWidth, outputHeight, anchorsLen, 1])).reshape([numBoxes, 1]);
    const boxClassProbs = tf.softmax(reshaped.slice([0, 0, 0, 5], [outputWidth, outputHeight, anchorsLen, classesLen])).reshape([numBoxes, classesLen]);
    const classProbs = tf.mul(boxConfidence, boxClassProbs);
    // prep
    const boxIndex = tf.range(0, outputWidth);
    const boxHeightIndex = tf.tile(boxIndex, [outputHeight]);
    const boxWidthindex = tf.tile(tf.expandDims(boxIndex, 0), [outputWidth, 1]).transpose().flatten();
    const boxIndexGrid = tf.transpose(tf.stack([boxHeightIndex, boxWidthindex])).reshape([outputWidth, outputHeight, 1, 2]);
    const convDims = tf.reshape(tf.tensor1d([outputWidth, outputHeight]), [1, 1, 1, 2]);
    // end
    boxxy = tf.div(tf.add(boxxy, boxIndexGrid), convDims);
    boxwh = tf.mul(boxwh, anchorsTensor);
    if (version === 'v3') {
      boxwh = tf.div(boxwh, tf.tensor([modelSize]));
    } else {
      boxwh = tf.div(boxwh, convDims);
    }
    const boxes = this.boxesToCorners(boxxy, boxwh).reshape([numBoxes, 4]);
    return [boxes, classProbs];
  }

  /**
   * transforms the yolo bounding box coordinates from `center` to `top left` and joins them.
   * @param boxXY a `tf.Tensor` representing the boxes `X, Y` coordinates.
   * @param boxWH a `tf.Tensor` representing the boxes `Width, Height` values.
   *
   * @returns a `tf.Tensor` representing the transformed & joined boxes coordinates
   */
  boxesToCorners(boxXY, boxWH) {
    const two = tf.scalar(2);
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
  }

  /**
   * rescales the boxes coordinates to the input image dimentions.
   * @param boxes a `tf.Tensor` representing the boxes coordinates. shape : `[numBoxes,4]`
   * @param imgWidth original input image Width.
   * @param imgHeight  original input image Height.
   *
   * @return a `tf.Tensor` representing the scaled boxes coordinates.
   */
  rescaleBoxes(boxes, imgWidth, imgHeight) {
    const width = tf.scalar(imgWidth);
    const height = tf.scalar(imgHeight);
    // this for [maxY, maxX, minY, minX]
    const imageDims = tf.stack([height, width, height, width]).reshape([1, 4]);
    // this for x y w h (ie when you don't use this.boxesToCorners())
    // const ImageDims = tf.stack([Width, Height, Width, Height]).reshape([1, 4]);
    return boxes.mul(imageDims);
  }

  /**
   * filters boxes synchronously by a `classProbThresh` Threshold
   * @param boxes a 2D box `tf.Tensor` with the shape of `[numBoxes,4]`
   * @param scores a 2D scores  `tf.Tensor`  with the shape of `[numBoxes,labelsLength]`
   * @param classProbThresh  a number indecating the score threshold defaults to .5
   *
   * @return a  `tf.Tensor[]` constaining `[filtredBoxes, filtredScores, filtredClasses]`
   *
   * normaly this would be inside a tf.tidy
   * so i skipped on the memory managment
   */
  filterBoxes(boxes, scores, classProbThresh = 0.5) {
    const boxScore = tf.max(scores, -1);
    const boxClasses = tf.argMax(scores, -1);
    // score filter mask
    const filterThresh = tf.scalar(classProbThresh);
    const filterMask = tf.greaterEqual(boxScore, filterThresh);
    // this is somewhat a replacment for tf.boolean_mask
    const indicesTensor = tf.linspace(0, boxes.shape[0] - 1, boxes.shape[0]).toInt();
    const negativeIndicesTensor = tf.fill([boxes.shape[0]], -1, 'int32');
    const indices = tf.where(filterMask, indicesTensor, negativeIndicesTensor);
    const filteredIndicesTensor = tf.tensor1d(indices.dataSync().filter(i => i >= 0), 'int32');
    return [boxes.gather(filteredIndicesTensor), boxScore.gather(filteredIndicesTensor), boxClasses.gather(filteredIndicesTensor)];
  }

  /**
   * filters boxes asynchronously by a `classProbThresh` Threshold
   * @param boxes a 2D box `tf.Tensor` with the shape of `[numBoxes,4]`
   * @param scores a 2D scores  `tf.Tensor`  with the shape of `[numBoxes,labelsLength]`
   * @param classProbThresh  a number indecating the score threshold defaults to .5
   *
   * @return a  `Promise<tf.Tensor[]>` constaining `[filtredBoxes, filtredScores, filtredClasses]`
   *
   * this is gooing to be called outside tf.tidy so we need to do memory managment manually
   * the input & output tensors will be clean outside so we should cleaned only the local variables
   */
  async filterBoxesAsync(boxes, scores, classProbThresh = 0.5) {
    const boxScore = tf.max(scores, -1);
    const boxClasses = tf.argMax(scores, -1);
    // filter mask
    const filterThresh = tf.scalar(classProbThresh);
    const filterMask = tf.greaterEqual(boxScore, filterThresh);
    // i think we can replace this with tf.setdiff1dAsync(x, y)
    // https://js.tensorflow.org/api/latest/#setdiff1dAsync
    const range = tf.linspace(0, boxes.shape[0] - 1, boxes.shape[0]);
    const indicesTensor = range.toInt();
    const negativeIndicesTensor = tf.fill([boxes.shape[0]], -1, 'int32');
    const indices = tf.where(filterMask, indicesTensor, negativeIndicesTensor);
    const filteredIndicesTensor = tf.tensor1d((await indices.data()).filter(i => i >= 0), 'int32');
    //  END
    const filtredBoxes = boxes.gather(filteredIndicesTensor);
    const filtredScores = boxScore.gather(filteredIndicesTensor);
    const filtredClasses = boxClasses.gather(filteredIndicesTensor);
    tf.dispose([boxScore, boxClasses, filterThresh, filterMask,
      range, indicesTensor, negativeIndicesTensor,
      indices, filteredIndicesTensor]);
    return [filtredBoxes, filtredScores, filtredClasses];
  }

  /**
   * a small utility check to see if `toBeDetermined` is a `tf.Tensor` or a `tf.Tensor[]`
   *
   * @param  toBeDetermined `tf.Tensor` || `tf.Tensor[]`
   *
   * @returns a `boolean` indicating if it's a `tf.Tensor` or a `tf.Tensor[]`
   */
  isTensorOrTensorArray(toBeDetermined) {
    if (toBeDetermined.shape) {
      return true;
    }
    return false;
  }

  /**
   * Implements Non-max Suppression
   *
   * @param boxArr an array containing the boxes coords:Length must be `numBoxes*4`
   * @param scoreArr an array  containing the boxes scores probability:Length must be `numBoxes`
   * @param classesArr an array  containing the detection label index:Length must be `numBoxes`
   * @param iou_thresh  Non-max Suppression Threshold
   *
   * @return RawDetection
   */
  NonMaxSuppression(boxArr, scoreArr, classesArr, iouThresh = 0.5) {
    const zipped = [];
    for (let i = 0; i < scoreArr.length; i += 1) {
      zipped.push([
        [boxArr[4 * i], boxArr[(4 * i) + 1], boxArr[(4 * i) + 2], boxArr[(4 * i) + 3]],
        scoreArr[i],
        classesArr[i],
      ]);
    }
    // Sort by descending order of scores (first index of zipped array)
    const sorted = zipped.sort((a, b) => b[1] - a[1]);
    const out = [];
    // Greedily go through boxes in descending score order and only
    // return boxes that are below the IoU threshold.
    for (let i = 0; i < sorted.length; i += 1) {
      let push = true;
      for (let j = 0; j < out.length; j += 1) {
        const IOU = this.iou(out[j][0], sorted[i][0]);
        if (IOU > iouThresh) {
          push = false;
          break;
        }
      }
      if (push) {
        out.push(sorted[i]);
      }
    }
    return out;
  }

  /**
   * Implement the intersection over union (IoU) between box1 and box2
   *
   * @param box1 -- first box, number list with coordinates `(x1, y1, x2, y2)`
   * @param box2 -- second box, number list with coordinates `(x1, y1, x2, y2)`
   *
   * @return the value of `interarea` /  `unionarea`
   */
  iou(box1, box2) {
    // Calculate the (y1, x1, y2, x2) coordinates of the intersection of box1 and box2. Calculate its Area.
    const xi1 = Math.max(box1[0], box2[0]);
    const yi1 = Math.max(box1[1], box2[1]);
    const xi2 = Math.min(box1[2], box2[2]);
    const yi2 = Math.min(box1[3], box2[3]);
    const interarea = (yi2 - yi1) * (xi2 - xi1);
    // Calculate the Union area by using Formula: Union(A,B) = A + B - Inter(A,B)
    const box1area = (box1[2] - box1[0]) * (box1[3] - box1[1]);
    const box2area = (box2[2] - box2[0]) * (box2[3] - box2[1]);
    const unionarea = (box1area + box2area) - interarea;
    // compute the IoU
    return interarea / unionarea;
  }
  /**
   * The final phase in the post processing that outputs the final `Detection[]`
   *
   * @param finalBoxes an array containing the raw box information
   *
   * @return a `Detection[]` with the final collected boxes
   */
  createDetectionArray(finalBoxes) {
    const detections = [];
    for (let i = 0; i < finalBoxes.length; i += 1) {
      const [maxY, maxX, minY, minX] = finalBoxes[i][0];
      const classIndex = finalBoxes[i][2];
      const detection = {
        labelIndex: classIndex,
        label: this.labels[classIndex],
        score: finalBoxes[i][1],
        x: maxX,
        y: maxY,
        w: minX - maxX,
        h: minY - maxY,
      };
      detections.push(detection);
    }
    return detections;
  }
}

const YOLO = (videoOr, optionsOr, cb) => {
  let video = null;
  let options = {};
  let callback = cb;

  if (videoOr instanceof HTMLVideoElement) {
    video = videoOr;
  } else if (typeof videoOr === 'object' && videoOr.elt instanceof HTMLVideoElement) {
    video = videoOr.elt; // Handle p5.js image
  } else if (typeof videoOr === 'function') {
    callback = videoOr;
  } else if (typeof videoOr === 'object') {
    options = videoOr;
  }

  if (typeof optionsOr === 'object') {
    options = optionsOr;
  } else if (typeof optionsOr === 'function') {
    callback = optionsOr;
  }

  options = {
    ...DEFAULTS,
    ...options,
  };


  return new YOLODetector(video, options, callback);
};

export default YOLO;
