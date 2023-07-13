// eslint-disable-next-line import/no-extraneous-dependencies
import { createImageData, ImageData } from "canvas";

export const asyncLoadImage = async (src) => {
  const img = new Image();
  if (src.startsWith('http')) {
    img.crossOrigin = "true";
  }
  img.src = src;
  await new Promise(resolve => {
    img.onload = resolve;
  });
  return img;
}

export const getRobin = async () => asyncLoadImage("https://cdn.jsdelivr.net/gh/ml5js/ml5-library@main/assets/bird.jpg")

export const randomImageData = (width = 200, height = 100) => {
  const length = width * height * 4; // 4 channels - RGBA
  // Create an array of random pixel values
  const array = Uint8ClampedArray.from(
    { length },
    () => Math.floor(Math.random() * 256)
  );
  // Initialize a new ImageData object
  return createImageData(array, width, height);
}

export const polyfillImageData = () => {
  if (!global.ImageData) {
    global.ImageData = ImageData;
  }
}
