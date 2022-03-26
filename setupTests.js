// eslint-disable-next-line import/no-extraneous-dependencies
const { ImageData } = require('canvas');

console.log("Beginning setup");

global.ImageData = ImageData;

console.log("Setup complete");
