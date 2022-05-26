// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
/* eslint no-await-in-loop: "off" */
/* eslint class-methods-use-this: "off" */

/*
 * FaceApi: real-time face recognition, and landmark detection
 * Ported and integrated from all the hard work by: https://github.com/justadudewhohacks/face-api.js?files=1
 */

import * as faceapi from "face-api.js";
import callCallback from "../utils/callcallback";
import handleArguments from "../utils/handleArguments";
import { mediaReady } from "../utils/imageUtilities";
import { getModelPath } from "../utils/modelLoader";

const DEFAULTS = {
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

class FaceApiBase {
  /**
   * Create FaceApi.
   * @param {HTMLVideoElement} video - An HTMLVideoElement.
   * @param {object} options - An object with options.
   * @param {function} callback - A callback to be called when the model is ready.
   */
  constructor(video, options, callback) {
    this.video = video;
    this.model = null;
    this.modelReady = false;
    this.detectorOptions = null;
    this.config = {
      minConfidence: this.checkUndefined(options.minConfidence, DEFAULTS.minConfidence),
      withLandmarks: this.checkUndefined(options.withLandmarks, DEFAULTS.withLandmarks),
      withDescriptors: this.checkUndefined(options.withDescriptors, DEFAULTS.withDescriptors),
      withTinyNet: this.checkUndefined(options.withTinyNet, DEFAULTS.withTinyNet),
      MODEL_URLS: {
        Mobilenetv1Model: this.checkUndefined(
          options.Mobilenetv1Model,
          DEFAULTS.MODEL_URLS.Mobilenetv1Model,
        ),
        TinyFaceDetectorModel: this.checkUndefined(
          options.TinyFaceDetectorModel,
          DEFAULTS.MODEL_URLS.TinyFaceDetectorModel,
        ),
        FaceLandmarkModel: this.checkUndefined(
          options.FaceLandmarkModel,
          DEFAULTS.MODEL_URLS.FaceLandmarkModel,
        ),
        FaceLandmark68TinyNet: this.checkUndefined(
          options.FaceLandmark68TinyNet,
          DEFAULTS.MODEL_URLS.FaceLandmark68TinyNet,
        ),
        FaceRecognitionModel: this.checkUndefined(
          options.FaceRecognitionModel,
          DEFAULTS.MODEL_URLS.FaceRecognitionModel,
        ),
      },
    };

    this.ready = callCallback(this.loadModel(), callback);
  }

  /**
   * Load the model and set it to this.model
   * @return {this} the BodyPix model.
   */
  async loadModel() {
    const modelOptions = [
      "Mobilenetv1Model",
      "TinyFaceDetectorModel",
      "FaceLandmarkModel",
      "FaceLandmark68TinyNet",
      "FaceRecognitionModel",
    ];

    Object.keys(this.config.MODEL_URLS).forEach(item => {
      if (modelOptions.includes(item)) {
        this.config.MODEL_URLS[item] = getModelPath(this.config.MODEL_URLS[item]);
      }
    });

    const {
      Mobilenetv1Model,
      TinyFaceDetectorModel,
      FaceLandmarkModel,
      FaceRecognitionModel,
      FaceLandmark68TinyNet,
    } = this.config.MODEL_URLS;

    this.model = faceapi;


    if (this.config.withTinyNet === true) {
      this.detectorOptions = new faceapi.TinyFaceDetectorOptions({
        minConfidence: this.minConfidence,
        inputSize: 512,
      });
    } else {
      this.detectorOptions = new faceapi.SsdMobilenetv1Options({
        minConfidence: this.minConfidence,
      });
    }

    // check which model to load - tiny or normal
    if (this.config.withTinyNet === true) {
      await this.model.loadFaceLandmarkTinyModel(FaceLandmark68TinyNet);
      await this.model.loadTinyFaceDetectorModel(TinyFaceDetectorModel);
    } else {
      await this.model.loadFaceLandmarkModel(FaceLandmarkModel);
      await this.model.loadSsdMobilenetv1Model(Mobilenetv1Model);
    }
    await this.model.loadFaceRecognitionModel(FaceRecognitionModel);

    this.modelReady = true;
    return this;
  }

  /**
   * .detect() - classifies multiple features by default
   * @param {*} optionsOrCallback
   * @param {*} configOrCallback
   * @param {*} cb
   */
  async detect(optionsOrCallback, configOrCallback, cb) {
    const { image, callback, options } = handleArguments(this.video, optionsOrCallback, configOrCallback, cb)
      .require('image',
        "No input image provided. If you want to classify a video, pass the video element in the constructor."
      );

    return callCallback(this.detectInternal(image, options || this.config), callback);
  }

  /**
   * Detects multiple internal function
   * @param {HTMLImageElement || HTMLVideoElement} imgToClassify
   * @param {Object} faceApiOptions
   */
  async detectInternal(imgToClassify, faceApiOptions) {
    await this.ready;
    await mediaReady(imgToClassify, true);

    // sets the return options if any are passed in during .detect() or .detectSingle()
    this.config = this.setReturnOptions(faceApiOptions);

    const { withLandmarks, withDescriptors } = this.config;

    let result;

    if (withLandmarks) {
      if (withDescriptors) {
        result = await this.model
          .detectAllFaces(imgToClassify, this.detectorOptions)
          .withFaceLandmarks(this.config.withTinyNet)
          .withFaceDescriptors();
      } else {
        result = await this.model
          .detectAllFaces(imgToClassify, this.detectorOptions)
          .withFaceLandmarks(this.config.withTinyNet);
      }
    } else if (!withLandmarks) {
      result = await this.model.detectAllFaces(imgToClassify);
    } else {
      result = await this.model
        .detectAllFaces(imgToClassify, this.detectorOptions)
        .withFaceLandmarks(this.config.withTinyNet)
        .withFaceDescriptors();
    }

    // always resize the results to the input image size
    result = this.resizeResults(result, imgToClassify.width, imgToClassify.height);
    // assign the {parts} object after resizing
    result = this.landmarkParts(result);

    return result;
  }

  /**
   * .detectSingle() - classifies a single feature with higher accuracy
   * @param {*} optionsOrCallback
   * @param {*} configOrCallback
   * @param {*} cb
   */
  async detectSingle(optionsOrCallback, configOrCallback, cb) {
    const { image, callback, options } = handleArguments(this.video, optionsOrCallback, configOrCallback, cb)
      .require('image',
        "No input image provided. If you want to classify a video, pass the video element in the constructor."
      );

    return callCallback(this.detectSingleInternal(image, options || this.config), callback);
  }

  /**
   * Detects only a single feature
   * @param {HTMLImageElement || HTMLVideoElement} imgToClassify
   * @param {Object} faceApiOptions
   */
  async detectSingleInternal(imgToClassify, faceApiOptions) {
    await this.ready;
    await mediaReady(imgToClassify, true);

    // sets the return options if any are passed in during .detect() or .detectSingle()
    this.config = this.setReturnOptions(faceApiOptions);

    const { withLandmarks, withDescriptors } = this.config;

    let result;
    if (withLandmarks) {
      if (withDescriptors) {
        result = await this.model
          .detectSingleFace(imgToClassify, this.detectorOptions)
          .withFaceLandmarks(this.config.withTinyNet)
          .withFaceDescriptor();
      } else {
        result = await this.model
          .detectSingleFace(imgToClassify, this.detectorOptions)
          .withFaceLandmarks(this.config.withTinyNet);
      }
    } else if (!withLandmarks) {
      result = await this.model.detectSingleFace(imgToClassify);
    } else {
      result = await this.model
        .detectSingleFace(imgToClassify, this.detectorOptions)
        .withFaceLandmarks(this.config.withTinyNet)
        .withFaceDescriptor();
    }

    // always resize the results to the input image size
    result = this.resizeResults(result, imgToClassify.width, imgToClassify.height);

    // assign the {parts} object after resizing
    result = this.landmarkParts(result);

    return result;
  }

  /**
   * Check if the given _param is undefined, otherwise return the _default
   * @param {*} _param
   * @param {*} _default
   */
  checkUndefined(_param, _default) {
    return _param !== undefined ? _param : _default;
  }

  /**
   * Sets the return options for .detect() or .detectSingle() in case any are given
   * @param {Object} faceApiOptions
   */
  setReturnOptions(faceApiOptions) {
    const output = Object.assign({}, this.config);
    const options = ["withLandmarks", "withDescriptors"];

    options.forEach(prop => {
      if (faceApiOptions[prop] !== undefined) {
        this.config[prop] = faceApiOptions[prop];
      } else {
        output[prop] = this.config[prop];
      }
    });

    return output;
  }

  /**
   * Resize results to size of input image
   * @param {*} str
   */
  resizeResults(detections, width, height) {
    if (width === undefined || height === undefined) {
      throw new Error("width and height must be defined");
    }
    return this.model.resizeResults(detections, {
      width,
      height
    });
  }

  /**
   * get parts from landmarks
   * @param {*} result
   */
  landmarkParts(result) {
    let output;
    // multiple detections is an array
    if (Array.isArray(result) === true) {
      output = result.map(item => {
        // if landmarks exist return parts
        const newItem = Object.assign({}, item);
        if (newItem.landmarks) {
          const { landmarks } = newItem;
          newItem.parts = {
            mouth: landmarks.getMouth(),
            nose: landmarks.getNose(),
            leftEye: landmarks.getLeftEye(),
            leftEyeBrow: landmarks.getLeftEyeBrow(),
            rightEye: landmarks.getRightEye(),
            rightEyeBrow: landmarks.getRightEyeBrow(),
            jawOutline: landmarks.getJawOutline(),
          };
        } else {
          newItem.parts = {
            mouth: [],
            nose: [],
            leftEye: [],
            leftEyeBrow: [],
            rightEye: [],
            rightEyeBrow: [],
            jawOutline: [],
          };
        }
        return newItem;
      });
      // single detection is an object
    } else {
      output = Object.assign({}, result);
      if (output.landmarks) {
        const { landmarks } = result;
        output.parts = {
          mouth: landmarks.getMouth(),
          nose: landmarks.getNose(),
          leftEye: landmarks.getLeftEye(),
          leftEyeBrow: landmarks.getLeftEyeBrow(),
          rightEye: landmarks.getRightEye(),
          rightEyeBrow: landmarks.getRightEyeBrow(),
        };
      } else {
        output.parts = {
          mouth: [],
          nose: [],
          leftEye: [],
          leftEyeBrow: [],
          rightEye: [],
          rightEyeBrow: [],
        };
      }
    }

    return output;
  }
}

const faceApi = (...inputs) => {
  const { video, options = {}, callback } = handleArguments(...inputs);
  const instance = new FaceApiBase(video, options, callback);
  return callback ? instance : instance.ready;
};

export default faceApi;
