// eslint-disable-next-line import/no-extraneous-dependencies
const { ImageData } = require('canvas');
// require('@tensorflow/tfjs-node');

async function setupTests() {
  console.log("Beginning setup");

  // Use the node-canvas ImageData polyfill
  if (!global.ImageData) {
    global.ImageData = ImageData;
  }

  console.log("Setup complete");
}

module.exports = setupTests;
