// eslint-disable-next-line import/no-extraneous-dependencies
import { createImageData } from "canvas";

const TEST_IMAGES = {
  robin: "https://cdn.jsdelivr.net/gh/ml5js/ml5-library@main/assets/bird.jpg",
  /**
   * Photo by Paul Korecky, Creative Commons licensed
   * source: https://flickr.com/photos/pixelmuell/48876718697/
   */
  koala: "https://live.staticflickr.com/65535/48876718697_3039534fb9_c.jpg",
  /**
   * Portrait of Harriet Tubman, public domain
   * source: https://commons.wikimedia.org/wiki/File:Harriet_Tubman_c1868-69_(cropped).jpg
   */
  harriet: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Harriet_Tubman_c1868-69_%28cropped%29.jpg/483px-Harriet_Tubman_c1868-69_%28cropped%29.jpg"
}

export const asyncLoadImage = async (src) => {
  const img = new Image();
  if (src.startsWith('http')) {
    img.crossOrigin = "true";
  }
  img.src = TEST_IMAGES[src] || src;
  await new Promise(resolve => {
    img.onload = resolve;
  });
  return img;
}

export const getRobin = async () => {
  return asyncLoadImage("https://cdn.jsdelivr.net/gh/ml5js/ml5-library@main/assets/bird.jpg");
}

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
    // eslint-disable-next-line global-require,import/no-extraneous-dependencies
    global.ImageData = require("canvas").ImageData;
  }
}
