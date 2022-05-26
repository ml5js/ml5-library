// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as tf from '@tensorflow/tfjs';
import {
  getImageElement,
  isAudio,
  isCanvas,
  isImageData,
  isImageElement,
  isImg,
  isP5Image,
  isVideo
} from "./handleArguments";
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

/**
 * Crop an image tensor to a square based on its smaller dimension.
 * @param {tf.Tensor3D} img
 * @return {tf.Tensor3D}
 */
const cropImage = (img) => {
  const size = Math.min(img.shape[0], img.shape[1]);
  const centerHeight = img.shape[0] / 2;
  const beginHeight = centerHeight - (size / 2);
  const centerWidth = img.shape[1] / 2;
  const beginWidth = centerWidth - (size / 2);
  return img.slice([beginHeight, beginWidth, 0], [size, size, 3]);
};

/**
 * Places an image element or ImageData onto a canvas.
 * If the image is already a canvas, return the same image rather than copying.
 * // Note: could add an additional argument to optionally copy a canvas.
 * @param {ImageElement | p5.Element | p5.Image | p5.Video | ImageData} img
 * @returns {HTMLCanvasElement}
 */
const drawToCanvas = (img) => {
  // Get the inner element from p5 objects.
  const source = isImageData(img) ? img : getImageElement(img);
  // Return existing canvases.
  if ( isCanvas(source)) {
    return source;
  }
  // Make sure that a valid source was found.
  if (!source) {
    throw new Error(
      'Invalid image. Image must be one of: HTMLCanvasElement, HTMLImageElement, HTMLVideoElement, ImageData, p5.Image, p5.Graphics, or p5.Video.'
    );
  }
  // Videos use properties videoWidth and videoHeight, while all others use width and height.
  const width = source.videoWidth || source.width;
  const height = source.videoHeight || source.height;
  // Create a canvas with the same dimensions.
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  // Draw to the canvas.
  const ctx = canvas.getContext('2d');
  if (isImageData(img)) {
    ctx.putImageData(img, 0, 0);
  } else {
    ctx.drawImage(source, 0, 0, width, height);
  }
  return canvas;
}

/**
 * Flip an image horizontally, using either p5 or canvas.
 * @param {CanvasImageSource | p5.Element | p5.Graphics} img
 * @returns {HTMLCanvasElement | p5.Renderer}
 */
const flipImage = (img) => {

  // If p5 is available and the image is a p5 image, flip using p5 and return a p5 graphics renderer.
  if (p5Utils.checkP5() && isP5Image(img)) {
    const p5Canvas = p5Utils.p5Instance.createGraphics(img.width, img.height);
    p5Canvas.push()
    p5Canvas.translate(img.width, 0);
    p5Canvas.scale(-1, 1);
    p5Canvas.image(img, 0, 0, img.width, img.height);
    p5Canvas.pop()
    return p5Canvas;
  }

  // Otherwise, flip using canvas.
  const canvas = drawToCanvas(img);
  const ctx = canvas.getContext('2d');
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(canvas, canvas.width * -1, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * For models which expect an input with a specific size.
 * Converts an image to a tensor, resizes it, and crops it to a square.
 * @param {ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} input
 * @param {[number, number]} [size]
 * @return {tf.Tensor3D}
 */
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

function isInstanceOfSupportedElement(subject) {
  return isImageElement(subject) || isImageData(subject);
}

function imgToPixelArray(img) {
  const canvas = drawToCanvas(img);
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return Array.from(imgData.data);
}

/**
 * Extract common logic from models accepting video input.
 * Makes sure that the video/audio/image data has loaded.
 * Optionally can wait for the next frame every time the function is called.
 * Will resolve immediately if the input is undefined or a different element type.
 * @param {InputImage | undefined} input
 * @param {boolean} nextFrame
 * @returns {Promise<void>}
 */
async function mediaReady(input, nextFrame) {
  if (input && (isVideo(input) || isAudio(input))) {
    if (nextFrame) {
      await tf.nextFrame();
    }
    if (input.readyState === 0) {
      await new Promise((resolve, reject) => {
        input.addEventListener('error', () => reject(input.error));
        input.addEventListener('loadeddata', resolve);
      });
    }
  } else if (input && isImg(input)) {
    if (!input.complete) {
      await new Promise((resolve, reject) => {
        input.addEventListener('error', reject);
        input.addEventListener('load', resolve);
      });
    }
  }
}

export {
  array3DToImage,
  processVideo,
  cropImage,
  imgToTensor,
  isInstanceOfSupportedElement,
  flipImage,
  imgToPixelArray,
  mediaReady
};
