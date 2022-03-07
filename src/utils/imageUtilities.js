// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as tf from '@tensorflow/tfjs';
import p5Utils from './p5Utils';

// Resize video elements
const processVideo = (input, size, callback = () => {}) => {
  const videoInput = input;
  const element = document.createElement('video');
  videoInput.onplay = () => {
    const stream = videoInput.captureStream();
    element.srcObject = stream;
    element.width = size;
    element.height = size;
    element.autoplay = true;
    element.playsinline = true;
    element.muted = true;
    callback();
  };
  return element;
};

// Converts a tf to DOM img
const array3DToImage = (tensor) => {
  const [imgHeight, imgWidth] = tensor.shape;
  const data = tensor.dataSync();
  const canvas = document.createElement('canvas');
  canvas.width = imgWidth;
  canvas.height = imgHeight;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < imgWidth * imgHeight; i += 1) {
    const j = i * 4;
    const k = i * 3;
    imageData.data[j + 0] = Math.floor(256 * data[k + 0]);
    imageData.data[j + 1] = Math.floor(256 * data[k + 1]);
    imageData.data[j + 2] = Math.floor(256 * data[k + 2]);
    imageData.data[j + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);

  // Create img HTML element from canvas
  const dataUrl = canvas.toDataURL();
  const outputImg = document.createElement('img');
  outputImg.src = dataUrl;
  outputImg.style.width = imgWidth;
  outputImg.style.height = imgHeight;
  tensor.dispose();
  return outputImg;
};

// Static Method: crop the image
const cropImage = (img) => {
  const size = Math.min(img.shape[0], img.shape[1]);
  const centerHeight = img.shape[0] / 2;
  const beginHeight = centerHeight - (size / 2);
  const centerWidth = img.shape[1] / 2;
  const beginWidth = centerWidth - (size / 2);
  return img.slice([beginHeight, beginWidth, 0], [size, size, 3]);
};

/**
 * Check if a variable is an instance of ImageData,
 * or a plain object with the same properties as ImageData.
 * This allows it to work in Node environments where ImageData is not defined.
 * @param {any} img
 * @returns {boolean}
 * @returns {img is ImageData}
 */
const isImageData = (img) => {
  if (typeof (ImageData) === 'undefined') {
    return (
      typeof img === 'object' &&
      img.data instanceof Uint8ClampedArray &&
      typeof img.width === 'number' &&
      typeof img.height === 'number'
    )
  }
  return img instanceof ImageData;
}

function isInstanceOfSupportedElement(subject) {
  return (subject instanceof HTMLVideoElement
    || subject instanceof HTMLImageElement
    || subject instanceof HTMLCanvasElement
    || isImageData(subject))
}

const flipImage = (img) => {
  // image image, bitmap, or canvas
  let imgWidth;
  let imgHeight;
  let inputImg;

  if (isInstanceOfSupportedElement(img)) {
    inputImg = img;
  } else if (typeof img === 'object' && isInstanceOfSupportedElement(img.elt)) {
    inputImg = img.elt; // Handle p5.js image
  } else if (typeof img === 'object' &&
    img.canvas instanceof HTMLCanvasElement) {
    inputImg = img.canvas; // Handle p5.js image
  } else {
    inputImg = img;
  }

  if (inputImg instanceof HTMLVideoElement) {
    // should be videoWidth, videoHeight?
    imgWidth = inputImg.width;
    imgHeight = inputImg.height;
  } else {
    imgWidth = inputImg.width;
    imgHeight = inputImg.height;
  }


  if (p5Utils.checkP5()) {
    const p5Canvas = p5Utils.p5Instance.createGraphics(imgWidth, imgHeight);
    p5Canvas.push()
    p5Canvas.translate(imgWidth, 0);
    p5Canvas.scale(-1, 1);
    p5Canvas.image(img, 0, 0, imgWidth, imgHeight);
    p5Canvas.pop()

    return p5Canvas;
  }
  const canvas = document.createElement('canvas');
  canvas.width = imgWidth;
  canvas.height = imgHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(inputImg, 0, 0, imgWidth, imgHeight);
  ctx.translate(imgWidth, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(canvas, imgWidth * -1, 0, imgWidth, imgHeight);
  return canvas;

}

// Static Method: image to tf tensor
function imgToTensor(input, size = null) {
  return tf.tidy(() => {
    let img = tf.browser.fromPixels(input);
    if (size) {
      img = tf.image.resizeBilinear(img, size);
    }
    const croppedImage = cropImage(img);
    const batchedImage = croppedImage.expandDims(0);
    return batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
  });
}

function imgToPixelArray(img){
  // image image, bitmap, or canvas
  let imgWidth;
  let imgHeight;
  let inputImg;
 
  if (isInstanceOfSupportedElement(img)) {
    inputImg = img;
  } else if (typeof img === 'object' && isInstanceOfSupportedElement(img)) {
    inputImg = img.elt; // Handle p5.js image
  } else if (typeof img === 'object' &&
     img.canvas instanceof HTMLCanvasElement) {
    inputImg = img.canvas; // Handle p5.js image
  } else {
    inputImg = img;
  }
 
  if (inputImg instanceof HTMLVideoElement) {
    // should be videoWidth, videoHeight?
    imgWidth = inputImg.width;
    imgHeight = inputImg.height;
  } else {
    imgWidth = inputImg.width;
    imgHeight = inputImg.height;
  }

  const canvas = document.createElement('canvas');
  canvas.width = imgWidth;
  canvas.height = imgHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(inputImg, 0, 0, imgWidth, imgHeight);

  const imgData = ctx.getImageData(0,0, imgWidth, imgHeight)
  return Array.from(imgData.data)
}

export {
  array3DToImage,
  processVideo,
  cropImage,
  imgToTensor,
  isInstanceOfSupportedElement,
  isImageData,
  flipImage,
  imgToPixelArray
};
