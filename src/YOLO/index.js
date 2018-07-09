// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
/* eslint max-len: ["error", { "code": 180 }] */

/*
YOLO Object detection
Heavily derived from https://github.com/ModelDepot/tfjs-yolo-tiny (ModelDepot: modeldepot.io)
*/

import * as tf from "@tensorflow/tfjs";
import CLASS_NAMES from "./../utils/COCO_CLASSES";

const DEFAULTS = {
  filterBoxesThreshold: 0.01,
  IOUThreshold: 0.4,
  classProbThreshold: 0.4,
  URL = "https://raw.githubusercontent.com/ml5js/ml5-library/master/src/YOLO/model.json",
};

class YOLO {

  constructor(options) {
    this.filterBoxesThreshold = options.filterBoxesThreshold || DEFAULTS.filterBoxesThreshold;
    this.IOUThreshold = options.IOUThreshold || DEFAULTS.IOUThreshold;
    this.classProbThreshold = options.classProbThreshold || DEFAULTS.classProbThreshold;
    this.modelURL = options.url || DEFAULTS.URL;
    this.model = null;
    this.inputWidth = 416;
    this.inputHeight = 416;
    this.classNames = CLASS_NAMES;
    this.anchors = [
      [0.57273, 0.677385],
      [1.87446, 2.06253],
      [3.33843, 5.47434],
      [7.88282, 3.52778],
      [9.77052, 9.16828]
    ];
    this.scaleX;
    this.scaleY;
    this.anchorsLength = this.anchors.length;
    this.classesLength = this.Params.classNames.length;
    this.init();

  }

  init() {
    // indices tensor to filter the elements later on 
    this.indicesTensor = tf.range(1, 846, 1, "int32");

    // Grid To Split the raw predictions : Assumes Our Model output is 1 Tensor with 13x13x425
    // gonna hard code all this stuff see if it works
    // this can be done once at the initial phase 
    // TODO : make this more modular 

    [this.ConvIndex, this.ConvDims, this.AnchorsTensor] = tf.tidy(() => {
      let ConvIndex = tf.range(0, 13);
      let ConvHeightIndex = tf.tile(ConvIndex, [13]);

      let ConvWidthindex = tf.tile(tf.expandDims(ConvIndex, 0), [13, 1]);
      ConvWidthindex = tf.transpose(ConvWidthindex).flatten();

      ConvIndex = tf.transpose(tf.stack([ConvHeightIndex, ConvWidthindex]));
      ConvIndex = tf.reshape(ConvIndex, [13, 13, 1, 2]);

      let ConvDims = tf.reshape(tf.tensor1d([13, 13]), [1, 1, 1, 2]);
      //AnchorsTensor
      let Aten = tf.tensor2d(this.anchors);
      let AnchorsTensor = tf.reshape(Aten, [1, 1, this.anchorsLength, 2]);

      return [ConvIndex, ConvDims, AnchorsTensor];
    });
  }

  // takes  HTMLCanvasElement || HTMLImageElement ||HTMLVideoElement || ImageData as input 
  // outs results obj
  async detect(input) {
    const predictions = tf.tidy(() => {
      const data = this.preProccess(input);
      const preds = this.model.predict(data);
      return preds;
    })
    const results = await this.postProccess(predictions);
    return results
  }

  async loadModel() {
    try {
      this.model = await tf.loadModel(this.modelURL);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }


  //does not dispose of the model atm 
  dispose() {
    tf.disposeconstiables();
  }

  // should be called after loadModel()
  cache() {
    tf.tidy(() => {
      const dummy = tf.zeros([0, 416, 416, 3])
      const data = this.model.predict(dummy)
    })
  }



  preProccess(input) {
    let img = tf.fromPixels(input)
    this.imgWidth = img.shape[1];
    this.imgHeight = img.shape[0];
    img = tf.image.resizeBilinear(img, [this.inputHeight, this.inputWidth])
      .toFloat()
      .div(tf.scalar(255))
      .expandDims(0);
    //Scale Stuff
    this.scaleX = this.imgHeight / this.inputHeight;
    this.scaleY = this.imgWidth / this.inputWidth;
    return img
  }


  async postProccess(rawPrediction) {

    let results = { totalDetections: 0, detections: [] }

    const [boxes, BoxScores, Classes, Indices] = tf.tidy(() => {

      rawPrediction = tf.reshape(rawPrediction, [13, 13, this.anchorsLength, this.classesLength + 5]);
      // Box Coords
      let BoxXY = tf.sigmoid(rawPrediction.slice([0, 0, 0, 0], [13, 13, this.anchorsLength, 2]))
      let BoxWH = tf.exp(rawPrediction.slice([0, 0, 0, 2], [13, 13, this.anchorsLength, 2]))
      // ObjectnessScore
      let BoxConfidence = tf.sigmoid(rawPrediction.slice([0, 0, 0, 4], [13, 13, this.anchorsLength, 1]))
      // ClassProb
      let BoxClassProbs = tf.softmax(rawPrediction.slice([0, 0, 0, 5], [13, 13, this.anchorsLength, this.classesLength]));
     
      // from boxes with xy wh to x1,y1 x2,y2
      // Mainly for NMS + rescaling 
      /*
      x1 = x + (h/2)
      y1 = y - (w/2)
      x2 = x - (h/2)
      y2 = y + (w/2)
      */
      // BoxScale
      BoxXY = tf.div(tf.add(BoxXY, this.ConvIndex), this.ConvDims);
     
      BoxWH = tf.div(tf.mul(BoxWH, this.AnchorsTensor), this.ConvDims);
     
      const Div = tf.div(BoxWH, tf.scalar(2))
     
      const BoxMins = tf.sub(BoxXY, Div);
     
      const BoxMaxes = tf.add(BoxXY, Div);
      const Size = [BoxMins.shape[0], BoxMins.shape[1], BoxMins.shape[2], 1];
     
      // main box tensor
      const boxes = tf.concat([BoxMins.slice([0, 0, 0, 1], Size),
      BoxMins.slice([0, 0, 0, 0], Size),
      BoxMaxes.slice([0, 0, 0, 1], Size),
      BoxMaxes.slice([0, 0, 0, 0], Size)
      ], 3)
        .reshape([845, 4])


      // Filterboxes by objectness threshold 
      // not filtering / getting a mask really 

      BoxConfidence = BoxConfidence.squeeze([3])
      const ObjectnessMask = tf.greaterEqual(BoxConfidence, tf.scalar(this.filterboxesThreshold))


      // Filterboxes by class probability threshold 
      const BoxScores = tf.mul(BoxConfidence, tf.max(BoxClassProbs, 3));
      const BoxClassProbMask = tf.greaterEqual(BoxScores, tf.scalar(this.classProbThreshold));

      //  getting classes indices 
      const Classes = tf.argMax(BoxClassProbs, -1)


      // Final Mask  each elem that survived both filters (0x0 0x1 1x0 = fail ) 1x1 = survived
      const FinalMask = BoxClassProbMask.mul(ObjectnessMask)

      const Indices = FinalMask.flatten().toInt().mul(this.IndicesTensor)
      return [boxes, BoxScores, Classes, Indices]
    })

    //we started at one in the range so we remove 1 now 

    let indicesArr = Array.from(await Indices.data()).filter(i => i > 0).map(i => i - 1);

    if (indicesArr.length == 0) {
      boxes.dispose()
      BoxScores.dispose()
      Classes.dispose()
      return results
    }
    const indicesTensor = tf.tensor1d(indicesArr, "int32");
    let filteredBoxes = boxes.gather(indicesTensor)
    let filteredScores = BoxScores.flatten().gather(indicesTensor)
    let filteredClasses = Classes.flatten().gather(indicesTensor)
    boxes.dispose()
    BoxScores.dispose()
    Classes.dispose()
    indicesTensor.dispose()

    //Img Rescale
    const Height = tf.scalar(this.imgHeight);
    const Width = tf.scalar(this.imgWidth)
    const ImageDims = tf.stack([Height, Width, Height, Width]).reshape([1, 4]);
    filteredBoxes = filteredBoxes.mul(ImageDims)

    // NonMaxSuppression 
    // GreedyNMS
    const [boxArr, scoreArr, classesArr] = await Promise.all([filteredBoxes.data(), filteredScores.data(), filteredClasses.data()]);
    filteredBoxes.dispose()
    filteredScores.dispose()
    filteredClasses.dispose()

    let zipped = [];
    for (let i = 0; i < scoreArr.length; i++) {
      // [Score,x,y,w,h,classindex]
      zipped.push([scoreArr[i], [boxArr[4 * i], boxArr[4 * i + 1], boxArr[4 * i + 2], boxArr[4 * i + 3]], classesArr[i]]);
    }

    // Sort by descending order of scores (first index of zipped array)
    const sorted = zipped.sort((a, b) => b[0] - a[0]);
    const selectedBoxes = []
    // Greedily go through boxes in descending score order and only
    // return boxes that are below the IoU threshold.
    sorted.forEach(box => {
      let Push = true;
      for (let i = 0; i < selectedBoxes.length; i++) {
        // Compare IoU of zipped[1], since that is the box coordinates arr
        let w = Math.min(box[1][3], selectedBoxes[i][1][3]) - Math.max(box[1][1], selectedBoxes[i][1][1]);
        let h = Math.min(box[1][2], selectedBoxes[i][1][2]) - Math.max(box[1][0], selectedBoxes[i][1][0]);
        let Intersection = w < 0 || h < 0 ? 0 : w * h
        let Union = (box[1][3] - box[1][1]) * (box[1][2] - box[1][0]) + (selectedBoxes[i][1][3] - selectedBoxes[i][1][1]) * (selectedBoxes[i][1][2] - selectedBoxes[i][1][0]) - Intersection
        let Iou = Intersection / Union
        if (Iou > this.IOUThreshold) {
          Push = false;
          break;
        }
      }
      if (Push) selectedBoxes.push(box);
    });

    // final phase 

    // add any output you want
    for (let id = 0; id < selectedBoxes.length; id++) {

      const classProb = selectedBoxes[id][0];
      const classProbRounded = Math.round(classProb * 1000) / 10
      const className = this.classNames[selectedBoxes[id][2]];
      const classIndex = selectedBoxes[id][2];
      const [x1, y1, x2, y2] = selectedBoxes[id][1];
      // Need to get this out 
      // TODO :  add a hsla color for later visualization 
      const resultObj = { id, className, classIndex, classProb, classProbRounded, x1, y1, x2, y2 };
      results.detections.push(resultObj);
    }
    // Misc 
    results.totalDetections = results.detections.length;
    results.scaleX = this.scaleX
    results.scaleY = this.scaleY

    return results
  }

}

export default YOLO;
