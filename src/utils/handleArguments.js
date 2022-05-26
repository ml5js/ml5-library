import * as tf from "@tensorflow/tfjs";
/**
 * @typedef ImageElement
 * @type {HTMLImageElement | HTMLCanvasElement | HTMLVideoElement}
 */

/**
 * Standard input accepted by most TensorFlow models.
 * @typedef InputImage
 * @type {ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | tf.Tensor3D}
 */

/**
 * ML5 models accept all TensorFlow image inputs as well as p5 images and videos.
 * @typedef ImageArg
 * @type {InputImage | p5.Image | p5.Video | p5.Element}
 */

/**
 * Check if a variable is an HTMLVideoElement.
 * @param {any} img
 * @returns {img is HTMLVideoElement}
 */
export const isVideo = (img) => {
  // Must guard all instanceof checks on DOM elements in order to run in node.
  return typeof (HTMLVideoElement) !== 'undefined' &&
    img instanceof HTMLVideoElement;
}

/**
 * Check if a variable is an HTMLAudioElement.
 * @param {any} img
 * @returns {img is HTMLAudioElement}
 */
export const isAudio = (img) => {
  return typeof (HTMLAudioElement) !== 'undefined' &&
    img instanceof HTMLAudioElement;
}

/**
 * Check if a variable is an HTMLCanvasElement.
 * @param {any} img
 * @returns {img is HTMLCanvasElement}
 */
export const isCanvas = (img) => {
  return typeof (HTMLCanvasElement) !== 'undefined' &&
    img instanceof HTMLCanvasElement;
}

/**
 * Check if a variable is an HTMLImageElement.
 * @param {any} img
 * @returns {img is HTMLImageElement}
 */
export const isImg = (img) => {
  return typeof (HTMLImageElement) !== 'undefined' &&
    img instanceof HTMLImageElement;
}

/**
 * Check if a variable is a p5.Image or other p5.Element.
 * @param {p5.Element | p5.Image} img
 * @returns {img is p5.Element | p5.Image}
 */
export const isP5Image = (img) => {
  return 'elt' in img || 'canvas' in img;
}

/**
 * Check if a variable is an instance of ImageData,
 * or a plain object with the same properties as ImageData.
 * This allows it to work in Node environments where ImageData is not defined.
 * @param {any} img
 * @returns {img is ImageData}
 */
export const isImageData = (img) => {
  if (typeof (ImageData) === 'undefined') {
    return (
      typeof img === 'object' &&
      // TODO: figure out TensorFlow issues with Uint8ClampedArray vs. Uint8Array
      (img.data instanceof Uint8ClampedArray || img.data instanceof Uint8Array) &&
      typeof img.width === 'number' &&
      typeof img.height === 'number'
    )
  }
  return img instanceof ImageData;
}

/**
 * Check if an unknown variable is a TensorFlow tensor with rank 3.
 * @param {any} img
 * @returns {img is tf.Tensor3D}
 */
export const isTensor3D = (img) => {
  return img instanceof tf.Tensor && img.rank === 3;
}

/**
 * Check if an image is one of HTMLImageElement, HTMLCanvasElement, HTMLVideoElement
 * @param {any} img
 * @returns {img is ImageElement}
 */
export const isImageElement = (img) => {
  return !!img && (isCanvas(img) || isImg(img) || isVideo(img));
}

/**
 * Check that the provided image is an acceptable format and return it.
 * If it is a p5 Image, return the underlying HTML element.
 * Otherwise, return null.
 * @param {any} img
 * @returns {ImageElement | null}
 */
export const getImageElement = (img) => {
  if (isImageElement(img)) {
    return img;
  }
  if (typeof img === 'object') {
    if (isImageElement(img.canvas)) {
      return img.canvas;
    }
    if (isImageElement(img.elt)) {
      return img.elt;
    }
  }
  return null;
}

/**
 * For methods which accept multiple optional arguments, a specific argument might be passed in multiple positions.
 * We can determine which argument is which by examining their values.
 *
 * Creates an object where each argument is assigned to a named property.
 * All properties are optional as arguments might be missing.
 */

/**
 * @typedef {object} StandardArguments
 * @property {string} [string] - A model name or any other string argument.
 * @property {number} [number] - Any numeric argument.
 * @property {function} [callback] - A callback function.
 * @property {object} [options] - Any object which is not a media object is assumed to be options.
 * @property {Array<any>} [array] - Any array.
 * @property {HTMLMediaElement} [audio] - Both video and audio-only elements will be assigned to the audio property.
 * @property {HTMLVideoElement} [video] - Video elements also get their own property.
 * @property {InputImage} [image] - Any video, image, or image data.
 */

/**
 * @class ArgHelper
 * @implements {StandardArguments}
 */
class ArgHelper {
  /**
   * Arguments used to CREATE an image-based model can be:
   *  - video: an HTMLVideoElement or p5 video.
   *  - options: an object of options specific to this model.
   *  - callback: a function to run once the model has been loaded. Called with arguments (error) or (error, result).
   *  - modelName: some models accept a model name or URL as an argument.
   *
   * Arguments used to CALL a method an image-based model can be:
   *  - image: an image or video element or an ImageData object.  Valid types: HTMLImageElement, HTMLCanvasElement,
   *    HTMLVideoElement, ImageData, p5 image, p5 video.
   *  - options: an object of options specific to this model.
   *  - callback: a function to run once the method has been completed.
   *
   * Expected to be provided in order modelName, video/image, options, callback with any omitted.
   * This function does not actually require any particular order.
   *
   * Later arguments will override earlier ones, so `this.video` should always be the first when providing arguments
   * from a class method call.
   *
   *  @param {any[]} [args]
   */
  constructor(...args) {
    args.forEach((arg) => this.addArg(arg));
  }

  /**
   * Can add arguments through the constructor or at any time after construction.
   *
   * @param {any} arg
   */
  addArg(arg) {
    // skip over falsey arguments and don't throw any error, assuming that these are omissions
    // do this check first to prevent accessing properties on null, which is an object
    if (arg === undefined || arg === null) {
      return;
    }
    switch (typeof arg) {
      case "string":
        this.set({ string: arg });
        break;
      case "number":
        this.set({ number: arg });
        break;
      case "function":
        this.set({ callback: arg });
        break;
      case "object": {
        if (isTensor3D(arg) || isImageData(arg)) {
          this.set({ image: arg });
        }
        // Handle p5 object and HTML elements.
        const element = getImageElement(arg);
        if (element) {
          this.set({ image: element });
          // Videos are also both images and audio.
          if (isVideo(element)) {
            this.set({
              audio: element,
              video: element
            });
          }
        }
        // TODO: handle p5.sound
        if (isAudio(arg)) {
            this.set({ audio: arg });
        }
        // Check for arrays
        else if (Array.isArray(arg)) {
          this.set({ array: arg });
        }
        // All other objects are assumed to be options.
        else {
          this.set({ options: arg });
        }
        break;
      }
      default:
        // Notify user about invalid arguments (would be ok to just skip)
        throw new Error("invalid argument"); // TODO: better message.
    }
  }

  /**
   * Set one or more properties and log a warning if it is already set.
   * Use the second argument to suppress the warning when overriding behavior is expected.
   *
   * @param {Partial<StandardArguments>} values
   * @param {boolean} warn
   */
  set(values, warn = true) {
    Object.keys(values).forEach(property => {
      if (warn && this.has(property)) {
        console.warn(
          `Received multiple ${property} arguments, but only a single ${property} is supported.
          The last ${property} will be used.`
        );
      }
      this[property] = values[property];
    });
  }

  /**
   * Check whether or not a given property has been set.
   *
   * @param {string & keyof StandardArguments} property
   * @returns {boolean}
   */
  has(property) {
    return this[property] !== undefined;
  }

  /**
   * Check that an argument exists and throw an error if it doesn't.
   *
   * @param {string & keyof StandardArguments} property
   * @param {string} [message]
   * @return {this}
   */
  require(property, message) {
    if (this.has(property)) {
      return this;
    }
    throw new Error(message || `An argument for ${property} must be provided.`);
  }
}

/**
 * Export a chainable method instead of the class itself.
 *
 * @param {any[]} args
 * @return {ArgHelper}
 */
export default function handleArguments(...args) {
  return new ArgHelper(...args);
};
