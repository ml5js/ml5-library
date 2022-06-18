const fs = require("fs");
const path = require("path");

const baseURL = path.resolve(__dirname, "../examples");
const webEditorURL = "https://editor.p5js.org/ml5/sketches";

/**
 * @typedef {{ name: string; type: string; url: string }} LinkData - data for a single link
 * @typedef {{[exampleName: string]: Array<LinkData>}} ModelExamples - all examples for a model.
 */

/**
 * Create empty output JSON and add to it.
 * @type {{[model: string]: ModelExamples}}
 */
const output = {};

/**
 * Find all example folders inside a given model folder.
 * @param {string} directoryPath
 * @return {string[]}
 */
const getDirectories = directoryPath => {
  return fs.readdirSync(directoryPath).filter(file => {
    return fs.statSync(`${directoryPath}/${file}`).isDirectory();
  });
};

/**
 * Append an example to the output.
 * Output is keyed by model, then by example name,
 * with an array of examples for each name.
 * @param {string} model
 * @param {LinkData} example
 * @void
 */
function addExample(model, example) {
  if (!(model in output)) {
    output[model] = {};
  }
  if (example.name in output[model]) {
    output[model][example.name].push(example);
  } else {
    output[model][example.name] = [example];
  }
}

/**
 * Convert type to nice URL anchor string.
 * @param {('javascript' | 'p5js' | 'd3')} type
 * @return {string}
 */
function formatName(type) {
  switch (type) {
    case 'p5js': return 'p5.js';
    case 'javascript': return 'JavaScript';
    case 'd3': return 'D3';
    default: return type;
  }
}

/**
 * Add all examples from a given directory.
 * @param {('javascript' | 'p5js' | 'd3')} type
 * @void
 */
function handleExampleType(type) {
  const examplesRoot = `${baseURL}/${type}`;
  const typeName = formatName(type);
  // Get an array of directories by model.
  const models = getDirectories(examplesRoot);
  // Loop through the individual demos inside each model directory.
  models.forEach(model => {
    const exampleNames = getDirectories(`${examplesRoot}/${model}`);

    exampleNames.forEach(name => {
      addExample(model, {
        name,
        type: typeName,
        url: `../${type}/${model}/${name}`
      });
      // Add both a local example and a web editor link for p5 examples.
      if (type === 'p5js') {
        addExample(model, {
          name,
          type: 'p5 Web Editor',
          url: `${webEditorURL}/${name}`
        });
      }
    });
  });
}

// Get all the references
handleExampleType('p5js');
handleExampleType('javascript');
handleExampleType('d3');

// write out to file
fs.writeFileSync(`${baseURL}/examples.json`, JSON.stringify(output, null, 2), "utf8");

console.log(`Created/update examples index json!!`);
