// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import bodyPix from "../index";
import * as tf from "@tensorflow/tfjs";
import * as tfBodyPix from "@tensorflow-models/body-pix";

jest.mock("@tensorflow-models/body-pix");

const BODYPIX_DEFAULTS = {
  multiplier: 0.75,
  outputStride: 16,
  segmentationThreshold: 0.5,
};

async function getImage() {
  const img = new Image();
  img.crossOrigin = true;
  img.src =
    "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models@master/tests/images/harriet_128x128.jpg";
  await new Promise(resolve => {
    img.onload = resolve;
  });
  return img;
}

async function getCanvas() {
  const img = await getImage();
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext("2d").drawImage(img, 0, 0);
  return canvas;
}

async function getImageData() {
  const arr = new Uint8ClampedArray(40000);

  // Iterate through every pixel
  for (let i = 0; i < arr.length; i += 4) {
    arr[i + 0] = 0; // R value
    arr[i + 1] = 190; // G value
    arr[i + 2] = 0; // B value
    arr[i + 3] = 255; // A value
  }

  // Initialize a new ImageData object
  const img = new ImageData(arr, 200);
  return img;
}

describe("bodyPix", () => {
  let bp;

  beforeAll(async () => {
    tfBodyPix.load = jest.fn().mockResolvedValue({});
    bp = await bodyPix();
  });

  it("Should create bodyPix with all the defaults", async () => {
    console.log(bp);
    expect(bp.config.multiplier).toBe(BODYPIX_DEFAULTS.multiplier);
    expect(bp.config.outputStride).toBe(BODYPIX_DEFAULTS.outputStride);
    expect(bp.config.segmentationThreshold).toBe(BODYPIX_DEFAULTS.segmentationThreshold);
  });

  // it("segment takes ImageData", async () => {
  //   const img = await getImageData();
  //   const results = await bp.segment(img);
  //   // 200 * 50 == 10,000 * 4 == 40,000 the size of the array
  //   expect(results.segmentation.width).toBe(200);
  //   expect(results.segmentation.height).toBe(50);
  // });

  // describe("segmentation", () => {
  //   it("Should segment an image of a Harriet Tubman with a width and height of 128", async () => {
  //     const img = await getImage();
  //     await bp.segment(img).then(results => {
  //       expect(results.segmentation.width).toBe(128);
  //       expect(results.segmentation.height).toBe(128);

  //       expect(results.segmentation.width).toBe(128);
  //       expect(results.segmentation.height).toBe(128);

  //       expect(results.segmentation.width).toBe(128);
  //       expect(results.segmentation.height).toBe(128);
  //     });
  //   });
  // });
});
