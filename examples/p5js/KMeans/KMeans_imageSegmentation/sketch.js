let kmeans;
let baseImage;
const data = [];

const imgSize = 30;
const colorDict = {
  0: [88, 214, 141], // green
  1: [202, 207, 210], // grey
  2: [97, 106, 107], // dark grey
  3: [44, 62, 80], // navy
  4: [249, 231, 159], // yellow
};

const options = {
  k: 3,
  maxIter: 4,
  threshold: 0.5,
};

function preload() {
  // img = loadImage('data/brooklyn-aerial.jpg')
  img = loadImage("data/world.jpg");
}

function setup() {
  createCanvas(200, 200);

  // get pixels from the loaded/resized image
  img.resize(imgSize, imgSize);
  img.loadPixels();

  // walk through the pixels and pull them out as
  // data to be sent to kmeans
  for (let x = 0; x < imgSize; x += 1) {
    for (let y = 0; y < imgSize; y += 1) {
      const off = (y * imgSize + x) * 4;
      const r = img.pixels[off];
      const g = img.pixels[off + 1];
      const b = img.pixels[off + 2];
      const a = img.pixels[off + 3];
      // push this to the globa data[] array
      data.push({
        r,
        g,
        b,
      });
    }
  }

  // display the resized image on another canvas
  baseImage = select("#baseImage");
  baseImageCtx = baseImage.elt.getContext("2d");
  baseImageCtx.drawImage(img.canvas, 0, 0, width, height);

  // call kmeans on the data
  kmeans = ml5.kmeans(data, options, modelReady);
}

function modelReady() {
  console.log("ready!");
  const dataset = kmeans.dataset;

  const segmented = createImage(imgSize, imgSize);
  segmented.loadPixels();

  // redraw the image using the color dictionary above
  // use the .centroid value to apply the color
  for (let x = 0; x < segmented.width; x += 1) {
    for (let y = 0; y < segmented.height; y += 1) {
      const off = x * imgSize + y;
      const c = colorDict[dataset[off].centroid];
      segmented.set(x, y, color(c));
    }
  }
  segmented.updatePixels();
  image(segmented, 0, 0, width, height);
}
