import * as tf from "@tensorflow/tfjs";

export type RawPropertyData = number | string | number[];

export type LoadedDatum = RawPropertyData | Record<PropertyKey, RawPropertyData>;

/**
 * A LayerJson object contains the arguments of the tf.layers function
 * and a `type` property with the name of the function.
 * Use a mapped union type to get all valid pairings.
 */
type TFLayers = typeof tf.layers;
export type LayerJson = {
  [K in keyof TFLayers]: TFLayers[K] extends (args: infer A) => tf.layers.Layer ? {
    type: K
  } & A : never;
}[keyof TFLayers]

export type TaskName = 'classification' | 'regression' | 'imageClassification';

export interface NeuralNetworkOptions {
  /**
   * Required - Can be:
   * number - count of input properties
   * number[] - image shape as [width, height, channels]
   * string[] - names of the properties to use as inputs
   */
  inputs: number | string[] | number[],
  /**
   * Required - Can be:
   * number - count of output properties, or the count of labels for a classification task.
   * string[] - names of the properties to use as outputs
   * TODO: is this ever number[]?
   */
  outputs: number | string[],
  /**
   * Optional - URL for a file of data to be used for training.
   */
  dataUrl?: string | null;
  /**
   * Optional - URL for a saved model to load.
   */
  modelUrl?: string | null;
  /**
   * Optional - Custom layer configurations for the underlying TensorFlow layers model.
   */
  layers?: LayerJson[];
  /**
   * Task for the model to perform. Should be one of:
   * 'classification', 'regression', 'imageClassification'
   */
  task: TaskName;
  /**
   * Optional - If true, show graphs while training.
   */
  debug: boolean;
  /**
   * Optional - Learning rate for training the model.
   * If not provided, the default learning rate will depend on the task.
   */
  learningRate?: number;
  /**
   * Optional - Will determine the number of units on the initial layer for 'regression' and 'classification' tasks.
   * Has no impact if the task is 'imageClassification'. Default: 16.
   * TODO: better explanation of what this is
   */
  hiddenUnits?: number;
  /**
   * Optional - If true, create the model layers without training data.
   * Use this is conjunction with the `mutate()` and `crossover()` functions for NeuroEvolution.
   */
  noTraining?: boolean;
}
