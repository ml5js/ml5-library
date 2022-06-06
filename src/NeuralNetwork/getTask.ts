import * as tf from '@tensorflow/tfjs';
import { LayerJson, NeuralNetworkOptions } from "./types";

/**
 * Separate all task-dependent logic into separate task objects to minimize if/else behavior
 * in the main Neural Network class and make it easier to potentially add more tasks in the future.
 * May want these to be classes which get the nn instance in the constructor.
 */

export type TaskName = 'classification' | 'regression' | 'imageClassification';

export interface NNTask {
  name: TaskName;

  // Can optionally override the standard defaults with custom defaults
  getDefaultOptions?(): Partial<NeuralNetworkOptions>;

  // Note: learningRate is always the first arg of the optimizer, but some optimizers support other optional args as well
  getCompileOptions(learningRate: number): tf.ModelCompileArgs;

  createLayers(inputShape: tf.Shape, hiddenUnits: number, outputUnits: number): LayerJson[];

  getSampleData(inputs: number | string[] | number[], outputs: number | string[]): { xs: number[], ys: (string | number)[] }[]

  // TODO: parseInputs and parseOutputs
}

// TODO: move elsewhere
function isStringArray(value: any): value is string[] {
  return Array.isArray(value) && value.some(v => typeof v === 'string');
}

// Handling of input sample is the same for all tasks.
function getSampleInput(inputs: number | string[] | number[]): number[] {
  if (isStringArray(inputs)) {
    throw new Error(`'inputs' cannot be an array of property names when using option 'noTraining'.  You must specify the number of inputs.`);
  }
  const inputSize = Array.isArray(inputs) ? inputs.reduce((a, b) => a * b) : inputs;
  return new Array(inputSize).fill(0);
}

const classificationTask: NNTask = {
  name: 'classification',
  getCompileOptions(learningRate) {
    return {
      loss: 'categoricalCrossentropy',
      optimizer: tf.train.sgd(learningRate),
      metrics: ['accuracy'],
    }
  },
  createLayers(inputShape, hiddenUnits, outputUnits) {
    return [
      {
        type: 'dense',
        units: hiddenUnits,
        activation: 'relu',
        inputShape
      },
      {
        type: 'dense',
        activation: 'softmax',
        units: outputUnits,
      },
    ];
  },
  getSampleData(inputs, outputs) {
    if (!isStringArray(outputs)) {
      throw new Error(`Invalid outputs ${outputs}. Outputs must be an array of label names when using option 'noTraining' with task 'classification'.`);
    }
    const xs = getSampleInput(inputs);
    return outputs.map(label => ({ xs, ys: [label] }));
  }
}

const imageClassificationTask: NNTask = {
  name: 'imageClassification',
  getDefaultOptions() {
    return {
      learningRate: 0.02
    }
  },
  getCompileOptions: classificationTask.getCompileOptions,
  createLayers(inputShape, hiddenUnits, outputUnits) {
    return [
      {
        type: 'conv2d',
        filters: 8,
        kernelSize: 5,
        strides: 1,
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
        inputShape,
      },
      {
        type: 'maxPooling2d',
        poolSize: [2, 2],
        strides: [2, 2],
      },
      {
        type: 'conv2d',
        filters: 16,
        kernelSize: 5,
        strides: 1,
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
      },
      {
        type: 'maxPooling2d',
        poolSize: [2, 2],
        strides: [2, 2],
      },
      {
        type: 'flatten',
      },
      {
        type: 'dense',
        kernelInitializer: 'varianceScaling',
        activation: 'softmax',
        units: outputUnits,
      },
    ];
  },
  getSampleData: classificationTask.getSampleData
}

const regressionTask: NNTask = {
  name: 'regression',
  getCompileOptions(learningRate) {
    return {
      loss: 'meanSquaredError',
      optimizer: tf.train.adam(learningRate),
      metrics: ['accuracy'],
    };
  },
  createLayers(inputShape, hiddenUnits, outputUnits) {
    return [
      {
        type: 'dense',
        units: hiddenUnits,
        activation: 'relu',
        inputShape
      },
      {
        type: 'dense',
        activation: 'sigmoid',
        units: outputUnits,
      },
    ];
  },
  getSampleData(inputs, outputs) {
    if (typeof outputs !== 'number') {
      throw new Error(`Invalid outputs ${outputs}. Outputs must be a number when using option 'noTraining' with task 'regression'.`);
    }
    return [{
      xs: getSampleInput(inputs),
      ys: new Array(outputs).fill(0)
    }]
  }
}

/**
 * Mapping of supported task configurations and their task names.
 * Use lowercase keys to make the lookup case-insensitive.
 */
const TASKS: Record<Lowercase<TaskName>, NNTask> = {
  regression: regressionTask,
  classification: classificationTask,
  imageclassification: imageClassificationTask,
}

/**
 * Get the correct task object based on the task name.
 */
export default function getTask(name: TaskName | string): NNTask {
  const task = TASKS[name.toLowerCase()];
  if (!task) {
    throw new Error(`Unknown task name '${name}'. Task must be one of ${Object.keys(TASKS).join(', ')}`);
  }
  return task;
}
