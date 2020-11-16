
export const getRobin = async () => {
  const img = new Image();
  img.crossOrigin = "";
  img.src = "https://cdn.jsdelivr.net/gh/ml5js/ml5-library@main/assets/bird.jpg";
  await new Promise(resolve => {
    img.onload = resolve;
  });
  return img;
}

export const getImageData = async () => {
  const arr = new Uint8ClampedArray(20000);

  // Iterate through every pixel
  for (let i = 0; i < arr.length; i += 4) {
    arr[i + 0] = 0; // R value
    arr[i + 1] = 190; // G value
    arr[i + 2] = 0; // B value
    arr[i + 3] = 255; // A value
  }

  // Initialize a new ImageData object
  const img = new ImageData(arr, 200);
  return img;
}