import { KeyObject } from "crypto";

// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const { faceApi } = ml5;

const FACEAPI_DEFAULTS = {
    withFaceLandmarks: true,
    withFaceExpressions: true,
    withFaceDescriptors: true,
    MODEL_URLS: {
        Mobilenetv1Model: 'https://raw.githubusercontent.com/ml5js/ml5-data-and-models/face-api/models/faceapi/ssd_mobilenetv1_model-weights_manifest.json',
        FaceLandmarkModel: 'https://raw.githubusercontent.com/ml5js/ml5-data-and-models/face-api/models/faceapi/face_landmark_68_model-weights_manifest.json',
        FaceLandmark68TinyNet: 'https://raw.githubusercontent.com/ml5js/ml5-data-and-models/face-api/models/faceapi/face_landmark_68_tiny_model-weights_manifest.json',
        FaceRecognitionModel: 'https://raw.githubusercontent.com/ml5js/ml5-data-and-models/face-api/models/faceapi/face_recognition_model-weights_manifest.json',
        FaceExpressionModel: 'https://raw.githubusercontent.com/ml5js/ml5-data-and-models/face-api/models/faceapi/face_expression_model-weights_manifest.json'
    }
}


describe('faceApi', () => {
  let faceapi;

  async function getImage() {
    const img = new Image();
    img.crossOrigin = true;
    img.src = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models@master/tests/images/harriet_128x128.jpg';
    await new Promise((resolve) => { img.onload = resolve; });
    return img;
  }

  async function getCanvas() {
    const img = await getImage();
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0);
    return canvas;
  }

  beforeEach(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
    faceapi = await faceApi();
  });

  it('Should create faceApi with all the defaults', async () => {
    expect(bp.config.withFaceLandmarks).toBe(FACEAPI_DEFAULTS.withFaceLandmarks);
    expect(bp.config.withFaceExpressions).toBe(FACEAPI_DEFAULTS.withFaceExpressions);
    expect(bp.config.withFaceDescriptors).toBe(FACEAPI_DEFAULTS.withFaceDescriptors);
  });

  describe('expressions', () => {
    it('Should get expressions for Harriet Tubman', async () => {
      const img = await getImage();
      await faceapi.detectSingle(img)
        .then(results => {
            expect(results.expressions).any(Object);

        })
    });

  });
});
