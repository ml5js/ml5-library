let dbscanModel;
let clusterColors;
let optionsDiv;
let epsSlider;
let minPtsSlider;

let currentClusterCount = 2;

//  ----- Initialize the example: ------ //
function setup() {
  // make all those nice buttons
  makeButtons();
  makeOptions();
  // setup the drawing canvas
  const canvas = createCanvas(640, 480);
  // optional step: puts the canvas at a particular place in the document
  canvas.parent('#chart');
  // create different colors for each cluster
  clusterColors = [
    // you can use CSS color names, hex codes, or rgb values
    color('skyblue'),
    color('coral'),
    color('olive'),
    color('tan'),
    color('grey')
  ]
  // start with 2 cluster
  makeModel();
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
// create the options sliders
function makeOptions() {
  optionsDiv = createDiv();
  optionsDiv.parent(select('#buttons'));
  const minPtsLabel = createP('options.minPts: Minimum points per cluster');
  minPtsLabel.parent(optionsDiv);
  minPtsSlider = addSliderWithInput(1, 10, 3, 1);
  const epsLabel = createP('options.eps: Maximum distance between points in the same cluster (Epsilon)');
  epsLabel.parent(optionsDiv);
  epsSlider = addSliderWithInput(0, 1, 0.2, 0.001);
}

// STEP 3:
// create the model
function makeModel() {
  const eps = epsSlider.value();
  const minPts = minPtsSlider.value();
  // get the path to the data in our data folder dynamically
  const dataPath = `data/gaussian2d_${currentClusterCount}clusters.csv`;
  // create a new dbscan clustering each time on make()
  const options = {
    eps,
    minPts
  };
  dbscanModel = ml5.dbscan(dataPath, options, modelReady);
}

// STEP 4:
// when the model is ready, make the chart
function modelReady() {
  makeChart()
}

// STEP 5:
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
    // set the global value for currentClusterCount
    currentClusterCount = clusterCount;
    // make the model
    makeModel();
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

// create a slider and a text box which will each update the other
// returns the slider (for setting global variable)
function addSliderWithInput(min, max, initial, step) {
  // create a slider
  const slider = createSlider(min, max, initial, step);
  slider.size(400, 25);
  // create an <input> with type="number"
  const input = createInput(round(initial, 2), 'number');
  input.size(75, 25);
  // access the underlying DOM element to set advanced properties
  input.elt.step = step;
  input.elt.min = min;
  input.elt.max = max;
  // display side by side in optionDiv
  slider.parent(optionsDiv);
  input.parent(optionsDiv);
  slider.changed(function() {
    // set the input value to match
    input.value(slider.value());
    // make the model
    makeModel();
  });
  input.changed(function() {
    // set the slider value to match
    slider.value(input.value());
    // make the model
    makeModel();
  });
  return slider;
}

function draw() {
}
