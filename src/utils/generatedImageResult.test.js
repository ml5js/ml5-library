import * as tf from '@tensorflow/tfjs';
import p5 from 'p5';
import generatedImageResult from './generatedImageResult';
import p5Utils from './p5Utils';

const IMAGE_SIZE = 10;
const OUTPUT_LENGTH = 10 * 10 * 4;

/**
 * @param {tf.DataType} dtype
 * @param {number} channels
 * @return {tf.Tensor3D}
 */
const createTensor = (dtype = 'float32', channels = 3) => {
  const shape = [IMAGE_SIZE, IMAGE_SIZE, channels];
  const length = IMAGE_SIZE * IMAGE_SIZE * channels;
  const data = Array.from({ length }, () => Math.random() * (dtype === 'int32' ? 255 : 1));
  return tf.tensor3d(data, shape, dtype);
}

describe('generatedImageResult', () => {

  it("Can accept float values (0-1)", async () => {
    const input = createTensor('float32');
    const result = await generatedImageResult(input);
    expect(result.raw).toHaveLength(OUTPUT_LENGTH);
  });

  it("Can accept int values (0-255)", async () => {
    const input = createTensor('int32');
    const result = await generatedImageResult(input);
    expect(result.raw).toHaveLength(OUTPUT_LENGTH);
  });

  it("Can accept a 2D image", async () => {
    const input = createTensor('float32', 1).squeeze();
    const result = await generatedImageResult(input);
    expect(result.raw).toHaveLength(OUTPUT_LENGTH);
  });

  it("Can return tensors", async () => {
    const input = createTensor();
    const result = await generatedImageResult(input, { returnTensors: true });
    expect(result.tensor).toBeInstanceOf(tf.Tensor);
    expect(result.tensor).toBe(input);
    expect(input.isDisposed).toBe(false);
  });

  it("Can dispose of tensors", async () => {
    const input = createTensor();
    const result = await generatedImageResult(input, { returnTensors: false });
    expect(result.tensor).toBeUndefined();
    expect(input.isDisposed).toBe(true);
  });

  it("Can create a blob", async () => {
    const input = createTensor();
    const result = await generatedImageResult(input);
    expect(result.blob).not.toBeNull();
    expect(result.blob).toBeInstanceOf(Blob);
  });

  it("Will return image: `null` without p5", async () => {
    const input = createTensor();
    const result = await generatedImageResult(input);
    expect(result.image).toBeNull();
  });

  it("Can create a p5 image", async () => {
    p5Utils.setP5Instance(p5);
    window.URL.createObjectURL = jest.fn();
    const input = createTensor();
    const result = await generatedImageResult(input);
    expect(result.image).not.toBeNull();
    expect(result.image.width).toBe(IMAGE_SIZE);
    expect(result.image.height).toBe(IMAGE_SIZE);
    p5Utils.setP5Instance(undefined);
    window.URL.createObjectURL.mockReset();
  });

});
