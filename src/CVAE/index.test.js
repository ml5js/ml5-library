import * as tf from '@tensorflow/tfjs';
import cvae from './index';

const MODEL_PATH = 'https://raw.githubusercontent.com/ml5js/ml5-data-and-models/main/models/CVAE/quick_draw/manifest.json';
const LATENT_DIM = 16;
const OUTPUT_PIXELS = 28 * 28 * 4;
const EXAMPLE_LABEL = 'airplane';

describe('CVAE', () => {
  let model;

  const callbacks = {
    onGenerate: () => null,
    onConstruct: () => null
  }

  beforeAll(async () => {
    window.URL.createObjectURL = jest.fn();
    jest.setTimeout(10000);
    model = await cvae(MODEL_PATH);
  });

  afterEach(() => {
    window.URL.createObjectURL.mockReset();
  })

  it("Can be created asynchronously", async () => {
    await expect(model.ready).resolves.toBeTruthy();
    expect(model.model).toBeInstanceOf(tf.LayersModel);
  });

  it("Can be created with a callback function", async () => {
    jest.spyOn(callbacks, 'onConstruct');
    const otherModel = cvae(MODEL_PATH, callbacks.onConstruct);
    await otherModel.ready;
    expect(callbacks.onConstruct).toHaveBeenCalledTimes(1);
    expect(otherModel).toHaveProperty('generate');
  });

  it("Can create an image", async () => {
    const result = await model.generate(EXAMPLE_LABEL);
    expect(result.raw.length).toEqual(OUTPUT_PIXELS);
  });

  it("Accepts a latent vector", async () => {
    const values = Array.from({ length: LATENT_DIM }, () => Math.random() - .5);
    const result = await model.generate(EXAMPLE_LABEL, values);
    expect(result.raw.length).toEqual(OUTPUT_PIXELS);
  });

  it("Calls a callback on generate()", async () => {
    jest.spyOn(callbacks, 'onGenerate');
    await model.generate(EXAMPLE_LABEL, callbacks.onGenerate);
    expect(callbacks.onGenerate).toHaveBeenCalledTimes(1);
  });

  it("Rejects when called with an invalid label", async () => {
    expect.assertions(3);
    const callback = (err, result) => {
      expect(err).toBeInstanceOf(Error);
      expect(result).toBeUndefined();
    }
    await expect(model.generate('not a label', callback)).rejects.toThrowError();
  });
});
