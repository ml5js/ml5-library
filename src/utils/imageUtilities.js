// Utilities for images

/**
* @param imgData Array3D containing pixels of a img
* @return HTML image element
*/
const array3DToImage = (imgData) => {
  const [imgWidth, imgHeight] = imgData.shape;
  const data = imgData.dataSync();
  const canvas = document.createElement('canvas');
  canvas.width = imgWidth;
  canvas.height = imgHeight;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < imgWidth * imgHeight; i += 1) {
    const j = i * 4;
    const k = i * 3;
    imageData.data[j + 0] = Math.floor(256 * data[k + 0]);
    imageData.data[j + 1] = Math.floor(256 * data[k + 1]);
    imageData.data[j + 2] = Math.floor(256 * data[k + 2]);
    imageData.data[j + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);

  // Create img HTML element from canvas
  const dataUrl = canvas.toDataURL();
  const outputImg = document.createElement('img');
  outputImg.src = dataUrl;
  outputImg.style.width = imgWidth;
  outputImg.style.height = imgHeight;

  return outputImg;
};

export default array3DToImage;
