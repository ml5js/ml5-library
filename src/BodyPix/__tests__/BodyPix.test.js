// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { asyncLoadImage, polyfillImageData, randomImageData } from "../../utils/testingUtils";
import bodyPix from "../index";

const BODYPIX_DEFAULTS = {
  multiplier: 0.75,
  outputStride: 16,
  segmentationThreshold: 0.5,
};

describe("bodyPix", () => {
  let bp;

  async function getImage() {
    return asyncLoadImage(
      "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models@master/tests/images/harriet_128x128.jpg"
    );
  }

  async function getCanvas() {
    const img = await getImage();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext("2d").drawImage(img, 0, 0);
    return canvas;
  }

  beforeAll(async () => {
    polyfillImageData();
    jest.setTimeout(5000);
    bp = await bodyPix();
  });

  it("Should create bodyPix with all the defaults", async () => {
    expect(bp.config.multiplier).toBe(BODYPIX_DEFAULTS.multiplier);
    expect(bp.config.outputStride).toBe(BODYPIX_DEFAULTS.outputStride);
    expect(bp.config.segmentationThreshold).toBe(BODYPIX_DEFAULTS.segmentationThreshold);
  });

  it("segment takes ImageData", async () => {
    const img = await randomImageData(200, 50);
    const results = await bp.segment(img);
    expect(results.segmentation.width).toBe(200);
    expect(results.segmentation.height).toBe(50);
  });

  describe("segmentation", () => {
    it("Should segment an image of a Harriet Tubman with a width and height of 128", async () => {
      expect.assertions(2);
      const img = await getImage();
      await bp.segment(img).then(results => {
        expect(results.segmentation.width).toBe(128);
        expect(results.segmentation.height).toBe(128);
      });
    });
  });
});
