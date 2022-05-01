let dbscanModel;
let clusterColors;
let optionsP;

// epsilon and minPts value for each of the data sets
// found by trial and error - play with the interactive example to discover these
const epsilonValues = {
  2: 0.2,
  3: 0.063,
  4: 0.044,
  'circle': 0.08,
  'moon': 0.2
}
const minPtsValues = {
  2: 3,
  3: 3,
  4: 4,
  'circle': 2,
  'moon': 3
}

//  ----- Initialize the example: ------ //
function setup() {
  // make all those nice buttons
  makeButtons();
  // setup the drawing canvas
  const canvas = createCanvas(640, 480);
  // optional step: puts the canvas at a particular place in the document
  canvas.parent('#chart');
  // initialize empty element for writing options
  optionsP = createP();
  optionsP.parent('#chart');
  // create different colors for each cluster
  clusterColors = [
    // you can use CSS color names, hex codes, or rgb values
    color('skyblue'),
    color('coral'),
    color('olive'),
    color('tan'),
    color('grey')
  ]
  // start with 3 cluster
  makeModel(3);
}

// STEP 1:
// create all the buttons
function makeButtons() {
  addClusterButton(2);
  addClusterButton(3);
  addClusterButton(4);
  addClusterButton('circle');
  addClusterButton('moon');
}

// STEP 2:
// create the model
function makeModel(clusterCount) {
  const eps = epsilonValues[clusterCount];
  const minPts = minPtsValues[clusterCount];
  // write the options on the page
  optionsP.html(`Using options: <code>{ minPts: ${minPts}, eps: ${eps} }</code>`);
  // get the path to the data in our data folder dynamically
  const dataPath = `data/gaussian2d_${clusterCount}clusters.csv`;
  // create a new dbscan clustering each time on make()
  const options = {
    eps,
    minPts
  };
  dbscanModel = ml5.dbscan(dataPath, options, modelReady);
}

// STEP 3:
// when the model is ready, make the chart
function modelReady() {
  makeChart();
}

// STEP 4:
// use p5.js to make magic
function makeChart() {
  const dataset = dbscanModel.dataset;

  // clear the chart each time
  clear();

  // loop through all points and draw a circle for each one
  for (let i = 0; i < dataset.length; i++) {
    const point = dataset[i];
    const originalX = point[0];
    const originalY = point[1];
    const clusterIndex = point.clusterid;

    // scale the values to fit our chart, with some padding
    // map from the input range of 0 to 1
    const padding = 20;
    const circleX = map(originalX, 0, 1, padding, width - padding);
    const circleY = map(originalY, 0, 1, padding + 40, height - padding);

    // set the color based on the assigned cluster
    setFillColor(clusterIndex);
    noStroke();

    // draw the circle
    const diameter = 12;
    circle(circleX, circleY, diameter);
  }
}

//  ----- Helper functions: ------ //

// create a single button for a given cluster data set
function addClusterButton(clusterCount) {
  const button = createButton(`cluster: ${clusterCount}`);
  button.mousePressed(function () {
    makeModel(clusterCount);
  });
  // optional step: places the buttons above the chart
  button.parent(select('#buttons'));
}

// set the color for a cluster by its index
function setFillColor(clusterIndex) {
  // noise points will be black
  const isNoise = clusterIndex === undefined;
  if (isNoise) {
    fill(color('black'));
    return;
  }
  // if we have a color for this index already
  if (clusterIndex < clusterColors.length) {
    fill(clusterColors[clusterIndex]);
    return;
  }
  // there might be many clusters can be created, so we need to handle adding additional colors as needed.
  const newColor = color(random(0, 255), random(0, 255), random(0, 255));
  clusterColors.push(newColor);
  fill(newColor);
}
