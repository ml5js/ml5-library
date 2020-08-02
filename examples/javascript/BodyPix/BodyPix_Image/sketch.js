let bodypix;
let segmentation;
let img;
let canvas;
let ctx;
const width = 480;
const height = 560;

async function make() {
  img = new Image();
  img.src = 'data/harriet.jpg'
    
  bodypix = await ml5.bodyPix()
  segmentation = await bodypix.segment(img);

  canvas = createCanvas(width, height);
  ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0,0);

  const maskedBackground = await imageDataToCanvas(segmentation.raw.backgroundMask.data, segmentation.raw.backgroundMask.width, segmentation.raw.backgroundMask.height)
  ctx.drawImage(maskedBackground, 0, 0);

}

// call app.map.init() once the DOM is loaded
window.addEventListener('DOMContentLoaded', function() {
  make();
});

// Convert a ImageData to a Canvas
function imageDataToCanvas(imageData, x, y) {
  // console.log(raws, x, y)
  const arr = Array.from(imageData)
  const canvas = document.createElement('canvas'); // Consider using offScreenCanvas when it is ready?
  const ctx = canvas.getContext('2d');

  canvas.width = x;
  canvas.height = y;

  const imgData = ctx.createImageData(x, y);
  const { data } = imgData;

  for (let i = 0; i < x * y * 4; i += 1 ) data[i] = arr[i];
  ctx.putImageData(imgData, 0, 0);

  return ctx.canvas;
};

function createCanvas(w, h){
  const canvas = document.createElement("canvas"); 
  canvas.width  = w;
  canvas.height = h;
  document.body.appendChild(canvas);
  return canvas;
}