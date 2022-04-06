/* eslint-disable no-use-before-define */
// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import * as tfBodyPix from "@tensorflow-models/body-pix";
import bodyPix from "../index";

jest.mock("@tensorflow-models/body-pix");

const BODYPIX_DEFAULTS = {
  multiplier: 0.75,
  outputStride: 16,
  segmentationThreshold: 0.5,
};

const mockBodyPix = {
  mobileNet: {
    predict: jest.fn(),
    convToOutput: jest.fn(),
    dispose: jest.fn(),
  },
  predictForSegmentation: jest.fn(),
  predictForPartMap: jest.fn(),
  estimatePersonSegmentationActivation: jest.fn(),
  estimatePersonSegmentation: jest.fn(),
  estimatePartSegmentationActivation: jest.fn(),
  estimatePartSegmentation: jest.fn(),
  dispose: jest.fn(),
};

describe("bodyPix", () => {
  let bp;

  beforeAll(async () => {
    tfBodyPix.load = jest.fn().mockResolvedValue(mockBodyPix);
    bp = await bodyPix();
  });

  afterAll(async () => {
    jest.clearAllMocks();
  });

  it("Should create bodyPix with all the defaults", async () => {
    expect(bp.config.multiplier).toBe(BODYPIX_DEFAULTS.multiplier);
    expect(bp.config.outputStride).toBe(BODYPIX_DEFAULTS.outputStride);
    expect(bp.config.segmentationThreshold).toBe(BODYPIX_DEFAULTS.segmentationThreshold);
  });

  it("segment calls segmentInternal and returns", async () => {
    bp.segmentInternal = jest.fn().mockResolvedValue({
      segmentation: {
        data: [],
        width: 200,
        height: 50,
      },
    });
    const img = await getImageData();
    const results = await bp.segment(img);
    expect(bp.segmentInternal).toHaveBeenCalledTimes(1);
    expect(results.segmentation.width).toBe(200);
    expect(results.segmentation.height).toBe(50);
  });

  it("segmentWithParts calls segmentWithPartsInternal and returns", async () => {
    bp.segmentWithPartsInternal = jest.fn().mockResolvedValue({
      segmentation: {
        data: [],
        width: 200,
        height: 50,
      },
    });
    const img = await getImageData();
    const results = await bp.segmentWithParts(img);
    expect(bp.segmentWithPartsInternal).toHaveBeenCalledTimes(1);
    expect(results.segmentation.width).toBe(200);
    expect(results.segmentation.height).toBe(50);
  });
});

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
