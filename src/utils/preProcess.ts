import * as tf from '@tensorflow/tfjs';

/**
 * Common operations for pre-processing and post-processing images.
 */

// Note: can make this a generic of <T extends tf.Rank = tf.Rank.R4> with inputShape: tf.ShapeMap[T]
interface ProcessorConfig {
  inputShape: [number, number, number] | [number, number, number, number];
  /**
   * Value range expected by the model. Typically [-1, 1] or [0,1].
   */
  inputRange: [number, number];
  alignCorners?: boolean;
  resizeMethod?: 'bilinear' | 'nearest';
}

/**
 * Rescale the pixel values from one range to another.
 */
function rescale<T extends tf.Tensor>(tensor: T, inMin: number, inMax: number, outMin: number, outMax: number): T {
  // Note: could be one chained operation if useless ops like .sub(0) .div(1) are not a concern.
  return tf.tidy(() => {
    let result = tensor.toFloat();
    if (inMin !== 0) {
      result = tf.sub(result, tf.scalar(inMin));
    }
    const divisor = (inMax - inMin) / (outMax - outMin);
    if (divisor !== 1) {
      result = tf.div(result, tf.scalar(divisor));
    }
    if (outMin !== 0) {
      result = tf.add(result, tf.scalar(outMin));
    }
    return result;
  });
}

export default class ImageProcessor {
  /**
   * The options which were passed to the constructor.
   */
  private readonly config: ProcessorConfig;

  /**
   * The image input size expected by the underlying model.
   */
  public readonly size: [number, number];

  /**
   * The depth of the expected image. Can be 1 (grayscale), 3 (RGB) or 4 (RGBA).
   */
  public readonly numChannels: number;

  constructor(config: ProcessorConfig) {
    this.config = config;
    // Derive size and numChannels from the inputShape.
    const shape = config.inputShape;
    const [height, width, numChannels] = shape.length === 3 ? shape : shape.slice(1);
    this.numChannels = numChannels;
    this.size = [height, width];
  }

  resize<T extends tf.Tensor3D|tf.Tensor4D>(input: T): T {
    // Skip no-op resize.
    if (input.shape[0] === this.size[0] && input.shape[1] === this.size[1]) return input;
    // Use appropriate method based on config.
    const resizeFn = this.config.resizeMethod === 'nearest' ? tf.image.resizeNearestNeighbor : tf.image.resizeBilinear;
    return resizeFn(input, this.size, this.config.alignCorners);
  }

  /**
   * Pre-process an image based on the provided config. Handles:
   *  - conversion to tensor
   *  - correct number of channels (alpha, grayscale)
   *  - resizing
   *  - scaling the range of values
   *  - converting to 4D batch (if needed)
   */
  public preProcess(input: tf.Tensor3D | HTMLVideoElement | HTMLCanvasElement | HTMLImageElement) {
    return tf.tidy(() => {
      const { inputRange, inputShape } = this.config;
      // Convert to tensor, handle depth.
      const tensor = (input instanceof tf.Tensor) ? input : tf.browser.fromPixels(input, this.numChannels);
      // Resize width/height.
      const resized = this.resize(tensor);
      // Rescale values from range [0-255] to inputRange.
      const [min, max] = inputRange;
      const rescaled = rescale(resized, 0, 255, min, max);
      // Possible batch.
      return inputShape.length === 3 ? rescaled : rescaled.expandDims(0);
    });
  }

  // TODO: post-process, for models which return an image

}
