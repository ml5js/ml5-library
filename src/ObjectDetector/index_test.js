// Copyright (c) 2020 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { getRobin, randomImageData } from "../utils/testingUtils";
import objectDetector from "./index";

const ml5 = { objectDetector };

const COCOSSD_DEFAULTS = {
  base: "lite_mobilenet_v2",
  modelUrl: undefined,
};

const YOLO_DEFAULTS = {
  IOUThreshold: 0.4,
  classProbThreshold: 0.4,
  filterBoxesThreshold: 0.01,
  size: 416,
};

const mockYoloObject = {
  IOUThreshold: YOLO_DEFAULTS.IOUThreshold,
  classProbThreshold: YOLO_DEFAULTS.classProbThreshold,
  filterBoxesThreshold: YOLO_DEFAULTS.filterBoxesThreshold,
  size: YOLO_DEFAULTS.size,
  detect: () => {
    return [{ label: "bird", confidence: 0.9 }];
  },
};
const mockCocoObject = {
  config: { ...COCOSSD_DEFAULTS },
  detect: () => {
    return [{ label: "bird", confidence: 0.9 }];
  },
};

function mockObjectDetector(modelName) {
  switch (modelName) {
    case "yolo":
      return mockYoloObject;
    case "cocossd":
      return mockCocoObject;
    default:
      return mockCocoObject;
  }
}

describe("objectDetector", () => {
  jest.setTimeout(500000);

  /**
   * Test cocossd object detector
   */

  describe("objectDetector: cocossd", () => {
    let cocoDetector;

    beforeAll(async () => {
      jest.spyOn(ml5, "objectDetector").mockImplementation(mockObjectDetector);
      cocoDetector = await ml5.objectDetector("cocossd");
    });

    it("Should instantiate with the following defaults", () => {
      expect(ml5.objectDetector).toHaveBeenCalled();
      expect(cocoDetector.config.toString()).toBe(COCOSSD_DEFAULTS.toString());
    });

    it("detects a robin", async () => {
      jest.spyOn(cocoDetector, "detect").mockReturnValue([{ label: "bird", confidence: 0.9 }]);

      const robin = await getRobin();
      const detection = await cocoDetector.detect(robin);
      expect(detection[0].label).toBe("bird");
    });

    it("detects takes ImageData", async () => {
      jest.spyOn(cocoDetector, "detect").mockReturnValue([]);
      const img = randomImageData();
      const detection = await cocoDetector.detect(img);
      expect(detection).toEqual([]);
    });

    it("throws error when a non image is trying to be detected", async () => {
      jest.spyOn(cocoDetector, "detect").mockRejectedValue(new Error("Detection subject not supported"));
      const notAnImage = "not_an_image";
      try {
        await cocoDetector.detect(notAnImage);
        fail("Error should have been thrown");
      } catch (error) {
        expect(error.message).toBe("Detection subject not supported");
      }
    });
  });

  /**
   * Test YOLO object detector
   */
  describe("objectDetector: yolo", () => {
    let yolo;
    beforeAll(async () => {
      jest.spyOn(ml5, "objectDetector").mockImplementation(mockObjectDetector);
      yolo = await ml5.objectDetector("yolo", { disableDeprecationNotice: true, ...YOLO_DEFAULTS });
    });

    it("instantiates the YOLO classifier with defaults", () => {
      expect(ml5.objectDetector).toHaveBeenCalled();
      expect(yolo.IOUThreshold).toBe(YOLO_DEFAULTS.IOUThreshold);
      expect(yolo.classProbThreshold).toBe(YOLO_DEFAULTS.classProbThreshold);
      expect(yolo.filterBoxesThreshold).toBe(YOLO_DEFAULTS.filterBoxesThreshold);
      expect(yolo.size).toBe(YOLO_DEFAULTS.size);
    });

    it("detects a robin", async () => {
      jest.spyOn(yolo, "detect").mockReturnValue([{ label: "bird", confidence: 0.9 }]);
      const robin = await getRobin();
      const detection = await yolo.detect(robin);
      expect(detection[0].label).toBe("bird");
    });

    it("detects takes ImageData", async () => {
      jest.spyOn(yolo, "detect").mockReturnValue([]);
      const img = randomImageData();
      const detection = await yolo.detect(img);
      expect(detection).toEqual([]);
    });
  });
});
