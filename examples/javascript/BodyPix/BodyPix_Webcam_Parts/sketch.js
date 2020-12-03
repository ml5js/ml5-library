let bodypix;
let segmentation;
let video;
let canvas, ctx;
const width = 480;
const height = 360;

const options = {
  outputStride: 8, // 8, 16, or 32, default is 16
  segmentationThreshold: 0.3 // 0 - 1, defaults to 0.5 
}

async function make() {
  canvas = createCanvas(width, height);
  ctx = canvas.getContext('2d');
  // get the video
  video = await getVideo();
  // load bodyPix with video
  bodypix = await ml5.bodyPix(video)
  // run the segmentation on the video, handle the results in a callback
  bodypix.segmentWithParts(gotImage, options);
}

// when the dom is loaded, call make();
window.addEventListener('DOMContentLoaded', function() {
  make();
});


function gotImage(err, result){
  if(err) {
    console.log(err);
    return;
  }
  segmentation = result;
  ctx.drawImage(video, 0, 0, width, height);

  const parts = imageDataToCanvas(result.raw.partMask.data, result.raw.partMask.width, result.raw.partMask.height)
  ctx.drawImage(parts, 0, 0, width, height);

  bodypix.segmentWithParts(gotImage, options);
}

// Helper Functions
async function getVideo(){
  // Grab elements, create settings, etc.
  const videoElement = document.createElement('video');
  videoElement.setAttribute("style", "display: none;"); 
  videoElement.width = width;
  videoElement.height = height;
  document.body.appendChild(videoElement);

  // Create a webcam capture
  const capture = await navigator.mediaDevices.getUserMedia({ video: true })
  videoElement.srcObject = capture;
  videoElement.play();

  return videoElement
}

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