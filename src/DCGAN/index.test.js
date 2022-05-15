import * as tf from '@tensorflow/tfjs';
import dcgan from './index';

const MODEL_PATH = 'https://raw.githubusercontent.com/ml5js/ml5-library/main/examples/javascript/DCGAN/DCGAN_Random/model/geo/model.json';
const LATENT_DIM = 128;
const OUTPUT_PIXELS = 64 * 64 * 4;

describe('DCGAN', () => {
  let model;

  const callbacks = {
    onGenerate: () => null,
    onConstruct: () => null
  }

  beforeAll(async () => {
    jest.setTimeout(10000);
    model = await dcgan(MODEL_PATH);
  });

  it("Can be created asynchronously", async () => {
    await expect(model.ready).resolves.toBeTruthy();
    expect(model.model).toBeInstanceOf(tf.LayersModel);
  });

  it("Can be created with a callback function", async () => {
    jest.spyOn(callbacks, 'onConstruct');
    const otherModel = dcgan(MODEL_PATH, callbacks.onConstruct);
    await otherModel.ready;
    expect(callbacks.onConstruct).toHaveBeenCalledTimes(1);
    expect(otherModel).toHaveProperty('generate');
  });

  it("Can load from a manifest.json", async () => {
    const otherModel = await dcgan(MODEL_PATH.replace('model.json', 'manifest.json'));
    expect(otherModel.ready).resolves.toBeTruthy();
    expect(otherModel.model).toBeInstanceOf(tf.LayersModel);
  });

  // TODO: should it reject the promise instead?
  it("Throws an error if no model is provided", async () => {
    expect(() => dcgan()).toThrowError();
  });

  it("Can create an image", async () => {
    const result = await model.generate();
    expect(result.raw.length).toEqual(OUTPUT_PIXELS);
  });

  it("Accepts a latent vector", async () => {
    const values = Array.from({ length: LATENT_DIM }, () => Math.random() - .5);
    const result = await model.generate(values);
    expect(result.raw.length).toEqual(OUTPUT_PIXELS);
  });

  it("Calls a callback on generate()", async () => {
    jest.spyOn(callbacks, 'onGenerate');
    await model.generate(callbacks.onGenerate);
    expect(callbacks.onGenerate).toHaveBeenCalledTimes(1);
  });
});
