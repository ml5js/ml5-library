import * as mobilenet from "@tensorflow-models/mobilenet";
import ImageProcessor from '../utils/preProcess';

/**
 * Tiny wrapper around the tfjs-models mobilenet implementation to handle pre-processing of inputs.
 *
 * TODO: why do we use tfjs-models here, but our own implementation in FeatureExtractor?
 */

const IMAGE_SIZE = 224;

const processor = new ImageProcessor({
  inputRange: [0, 1],
  inputShape: [1, IMAGE_SIZE, IMAGE_SIZE, 3]
});

/**
 * @param {mobilenet.ModelConfig} config
 * @return {Promise<ClassifierModel>}
 */
// eslint-disable-next-line import/prefer-default-export
export async function load(config) {
  const model = await mobilenet.load(config);
  return {
    classify: (imgToPredict, topk) => {
      const processedImg = processor.preProcess(imgToPredict);
      return model.classify(processedImg, topk);
    }
  }
}
