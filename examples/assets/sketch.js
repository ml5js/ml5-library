/**
 * Use p5 in instance mode to create the red dot that follows the mouse position.
 * @param sketch - the p5 instance mode object
 */
const s = (sketch) => {

  // eslint-disable-next-line no-param-reassign
  sketch.setup = () => {
    sketch.createCanvas(sketch.displayWidth, sketch.displayHeight);
    sketch.textAlign(sketch.CENTER)
    sketch.colorMode(sketch.HSB, 360, 100, 100, 100);
  };

  // eslint-disable-next-line no-param-reassign
  sketch.draw = () => {
    sketch.background(0, 0, 100, 80);

    const dist = sketch.dist(sketch.pmouseX, sketch.pmouseY, sketch.mouseX, sketch.mouseY)
    const weight = sketch.constrain(dist, 1, 10)
    const col = sketch.map(weight, 1, 10, 0, 360);
    sketch.strokeWeight(weight);
    sketch.stroke(col, 100, 100)
    sketch.line(sketch.pmouseX, sketch.pmouseY, sketch.mouseX, sketch.mouseY);
  };
};

/**
 * @typedef {{ name: string; type: string; url: string }} LinkData - data for a single link
 * @typedef {{[exampleName: string]: Array<LinkData>}} ModelExamples - all examples for a model.
 * @typedef {{[model: string]: ModelExamples}} JsonData - the entire JSON file, or a filtered version.
 */
/**
 * Setup global variable representing the data from the examples.json file.
 * @type {JsonData}
 */
let data;

/**
 * Access all html elements.
 */
const $main = document.querySelector('main');
const $search = document.querySelector('.header-search__input');
const $toggleList = document.getElementById('list-view');
const $toggleCard = document.getElementById('card-view');

async function init() {

  data = await fetch('./examples.json').then(res => res.json());

  // initialize with all sections
  createSections(data);

  // p5 sketch
  // eslint-disable-next-line no-unused-vars
  const myp5 = new p5(s, 'myCanvas');
}

// Execute code on load.
init();

/**
 * Fills in the contents of the model section with a list of examples.
 * @param {ModelExamples} json
 * @param {HTMLElement} section
 */
function createGroupedExamples(json, section) {
  const examplesList = document.createElement('ul');
  examplesList.classList.add('examples-list');
  section.appendChild(examplesList);

  Object.keys(json).forEach(exampleName => {
    const exampleEl = document.createElement('li');
    exampleEl.classList.add('example');

    const title = document.createElement('h3');
    title.classList.add('example__title');
    title.textContent = exampleName.replaceAll('_', ' ');

    exampleEl.appendChild(title);

    const linksList = document.createElement('ul');
    linksList.classList.add('example__links');

    exampleEl.appendChild(linksList);

    json[exampleName].forEach(linkData => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.innerText = linkData.type;
      a.href = linkData.url;
      li.appendChild(a);
      linksList.appendChild(li);
    });

    examplesList.appendChild(exampleEl);
  });
}

/**
 * Creates a section for each model.
 * @param {JsonData} filteredData
 */
function createSections(filteredData) {
  // Clear all previous content.
  $main.innerHTML = '';
  // Create and append a child for each model.
  Object.keys(filteredData).forEach(modelName => {
    const examples = filteredData[modelName];

    const sectionDiv = document.createElement('section');
    sectionDiv.classList.add(`section`);
    sectionDiv.classList.add(`section-${modelName.toLowerCase()}`);

    // add a header
    const header = document.createElement('h2');
    header.classList.add(`section-header`);
    header.textContent = modelName;
    sectionDiv.appendChild(header);

    createGroupedExamples(examples, sectionDiv);

    $main.appendChild(sectionDiv)
  });
}

$search.addEventListener('keyup', (e) => {
  const query = e.target.value.trim().toLowerCase();

  if (query === '') {
    createSections(data);
  } else {
    const matches = {};
    Object.keys(data).forEach(model => {
      // if the model name matches, return all examples.
      if (model.toLowerCase().includes(query)) {
        matches[model] = data[model];
      } else {
        // if not, look for matches in the example name.
        const exampleMatches = Object.keys(data[model]).filter(name => name.toLowerCase().includes(query));
        if (exampleMatches.length) {
          matches[model] = {};
          exampleMatches.forEach(name => {
            matches[model][name] = data[model][name];
          });
        }
      }
    });
    createSections(matches);
  }
});

// Switch between list and card view by setting a class name on the <main> element.
// Add and remove class 'active' on the links to highlight the active view.

$toggleList.addEventListener('click', () => {
  $toggleList.classList.add('active');
  $toggleCard.classList.remove('active');
  $main.className = 'list-view';
});

$toggleCard.addEventListener('click', () => {
  $toggleCard.classList.add('active');
  $toggleList.classList.remove('active');
  $main.className = 'card-view';
});
