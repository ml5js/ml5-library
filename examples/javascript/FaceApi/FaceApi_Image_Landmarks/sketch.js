let faceapi;
let img;
let detections;
const width = 200;
const height = 200;
let canvas, ctx;

// by default all options are set to true
const detectionOptions = {
  withLandmarks: true,
  withDescriptors: false,
};

async function make() {
  img = new Image();
  img.src = "assets/frida.jpg";
  img.width = width;
  img.height = height;

  canvas = createCanvas(width, height);
  ctx = canvas.getContext("2d");

  faceapi = await ml5.faceApi(detectionOptions, modelReady);

  // faceapi.detectSingle(img, gotResults)
}
// call app.map.init() once the DOM is loaded
window.addEventListener("DOMContentLoaded", function() {
  make();
});

function modelReady() {
  console.log("ready!");
  faceapi.detectSingle(img, gotResults);
}

function gotResults(err, result) {
  if (err) {
    console.log(err);
    return;
  }
  // console.log(result)
  detections = result;

  ctx.drawImage(img, 0, 0, width, height);

  if (detections) {
    console.log(detections);
    drawBox(detections);
    drawLandmarks(detections);
  }
}

function drawBox(detections) {
  const alignedRect = detections.alignedRect;
  const { _x, _y, _width, _height } = alignedRect._box;
  // canvas.fillStyle = 'none';
  ctx.rect(_x, _y, _width, _height);
  ctx.strokeStyle = "#a15ffb";
  ctx.stroke();
}

function drawLandmarks(detections) {
  // mouth
  ctx.beginPath();
  detections.parts.mouth.forEach((item, idx) => {
    if (idx === 0) {
      ctx.moveTo(item._x, item._y);
    } else {
      ctx.lineTo(item._x, item._y);
    }
  });
  ctx.closePath();
  ctx.stroke();

  // nose
  ctx.beginPath();
  detections.parts.nose.forEach((item, idx) => {
    if (idx === 0) {
      ctx.moveTo(item._x, item._y);
    } else {
      ctx.lineTo(item._x, item._y);
    }
  });
  ctx.stroke();

  // // left eye
  ctx.beginPath();
  detections.parts.leftEye.forEach((item, idx) => {
    if (idx === 0) {
      ctx.moveTo(item._x, item._y);
    } else {
      ctx.lineTo(item._x, item._y);
    }
  });
  ctx.closePath();
  ctx.stroke();

  // // right eye
  ctx.beginPath();
  detections.parts.rightEye.forEach((item, idx) => {
    if (idx === 0) {
      ctx.moveTo(item._x, item._y);
    } else {
      ctx.lineTo(item._x, item._y);
    }
  });

  ctx.closePath();
  ctx.stroke();

  // // right eyebrow
  ctx.beginPath();
  detections.parts.rightEyeBrow.forEach((item, idx) => {
    if (idx === 0) {
      ctx.moveTo(item._x, item._y);
    } else {
      ctx.lineTo(item._x, item._y);
    }
  });
  ctx.stroke();
  // canvas.closePath();

  // // left eyeBrow
  ctx.beginPath();
  detections.parts.leftEyeBrow.forEach((item, idx) => {
    if (idx === 0) {
      ctx.moveTo(item._x, item._y);
    } else {
      ctx.lineTo(item._x, item._y);
    }
  });
  // canvas.closePath();

  ctx.strokeStyle = "#a15ffb";
  ctx.stroke();
}

// Helper Functions
function createCanvas(w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  document.body.appendChild(canvas);
  return canvas;
}
