/**
 * Based on:
 * https://github.com/PAIR-code/deeplearnjs/blob/master/demos/imagenet/imagenet.ts
 */

const TOP_K_CLASSES = 5;

class ImageNet {

  constructor() {
    this.gl = deeplearn.gpgpu_util.createWebGLContext();
    this.gpgpu = new deeplearn.GPGPUContext(this.gl);
    this.math = new deeplearn.NDArrayMathGPU(this.gpgpu);
    this.mathCPU = new deeplearn.NDArrayMathCPU();
    this.squeezeNet = new SqueezeNet(this.math);
    this.squeezeNet.load().then(() => {
      console.log("ready");
    });
  }

  inference(img) {
    const image = deeplearn.Array3D.fromPixels(img);
    const inferenceResult = this.squeezeNet.predict(image);
    const namedActivations = inferenceResult.namedActivations;
    this.layerNames = Object.keys(namedActivations);
    // const topClassesToProbability = this.getTopKClasses(
    //   inferenceResult.logits, TOP_K_CLASSES);
    // let count = 0;
    // for (const className in topClassesToProbability) {
    //   if (!(className in topClassesToProbability)) {
    //     continue;
    //   }
    //   console.log(className);
    //   count++;
    // }
  }
}

/**
 * Get the topK classes for pre-softmax logits. Returns a map of className
 * to softmax normalized probability.
 *
 * @param logits Pre-softmax logits array.
 * @param topK How many top classes to return.
 */
// function getTopKClasses(logits, topK) {
//   const predictions = this.math.softmax(logits);
//   const topk = new NDArrayMathCPU().topK(predictions, topK);
//   const topkIndices = topk.indices.data();
//   const topkValues = topk.values.data();
//
//   for (let i = 0; i < topkIndices.length; i++) {
//     topClassesToProbability[IMAGENET_CLASSES[topkIndices[i]]] = topkValues[i];
//   }
//   return topClassesToProbability;
// }
