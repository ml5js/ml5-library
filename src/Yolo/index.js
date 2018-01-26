/* eslint prefer-destructuring: ["error", {VariableDeclarator: {object: false}}] */
/*
YOLO
*/

import { ENV, Array3D } from 'deeplearn';
import { YoloMobileNetDetection } from './yolo_mobilenet';
import IMAGENET_CLASSES from './../utils/IMAGENET_CLASSES';

class Yolo {
  constructor(callback, canvas = null) {
    this.ready = false;
    this.math = ENV.math;
    this.canvas = canvas;
    this.yoloMobileNet = new YoloMobileNetDetection(this.math);
    this.yoloMobileNet.load().then(() => {
      this.ready = true;
      callback();
    });
  }

  async predict(input, callback) {
    if (this.ready) {
      const pixels = Array3D.fromPixels(input);
      const result = await this.yoloMobileNet.predict(pixels);
      const BoundingBoxes = await this.yoloMobileNet.interpretNetout(result);
      if (this.canvas) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const boxes = [];
        BoundingBoxes.forEach((box) => {
          const prob = box.getMaxProb().toFixed(2).toString();
          const boxColor = box.getColor();
          const color = boxColor.substring(4, boxColor.length - 1).replace(/ /g, '').split(',');
          const x = (box.x - (box.w / 2)) * width;
          const y = (box.y - (box.h / 2)) * height;
          const w = box.w * width;
          const h = box.h * height;
          const index = box.index;
          const label = IMAGENET_CLASSES[box.index];
          boxes.push({
            color,
            label,
            prob,
            x,
            y,
            w,
            h,
            index,
          });
        });
        callback({
          BoundingBoxes,
          boxes,
        });
      } else {
        callback({
          BoundingBoxes,
        });
      }
    } else {
      callback({
        result: [],
        boxes: [],
      });
    }
  }
}

export default Yolo;
