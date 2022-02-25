// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import "cross-fetch/polyfill";
import { asyncLoadImage } from "../utils/testingUtils";
import faceApi from "./index";

const FACEAPI_DEFAULTS = {
  withLandmarks: true,
  withDescriptors: true,
  minConfidence: 0.5,
  withTinyNet: true,
  MODEL_URLS: {
    Mobilenetv1Model:
      "https://raw.githubusercontent.com/ml5js/ml5-data-and-models/main/models/faceapi/ssd_mobilenetv1_model-weights_manifest.json",
    TinyFaceDetectorModel:
      "https://raw.githubusercontent.com/ml5js/ml5-data-and-models/main/models/faceapi/tiny_face_detector_model-weights_manifest.json",
    FaceLandmarkModel:
      "https://raw.githubusercontent.com/ml5js/ml5-data-and-models/main/models/faceapi/face_landmark_68_model-weights_manifest.json",
    FaceLandmark68TinyNet:
      "https://raw.githubusercontent.com/ml5js/ml5-data-and-models/main/models/faceapi/face_landmark_68_tiny_model-weights_manifest.json",
    FaceRecognitionModel:
      "https://raw.githubusercontent.com/ml5js/ml5-data-and-models/main/models/faceapi/face_recognition_model-weights_manifest.json",
  },
};

const FRIDA = 'https://raw.githubusercontent.com/ml5js/ml5-library/main/examples/javascript/FaceApi/FaceApi_Image_Landmarks/assets/frida.jpg';

describe('faceApi', () => {
  let faceapi;

  beforeAll(async () => {
    jest.setTimeout(15000);
    faceapi = await faceApi();
  });

  describe('landmarks', () => {

    it('Should create faceApi with all the defaults', async () => {
      expect(faceapi.config.withLandmarks).toBe(FACEAPI_DEFAULTS.withLandmarks);
      expect(faceapi.config.withDescriptors).toBe(FACEAPI_DEFAULTS.withDescriptors);
    });

    it('Should get landmarks for Frida', async () => {
      const img = await asyncLoadImage(FRIDA);
      await faceapi.detectSingle(img)
        .then(results => {
          expect(results.landmarks).toEqual(jasmine.any(Object));
        })
    });
  });
});
