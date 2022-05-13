const s = ( sketch ) => {

  sketch.setup = () => {
    sketch.createCanvas(sketch.displayWidth, sketch.displayHeight);
    sketch.textAlign(sketch.CENTER)
    sketch.colorMode(sketch.HSB, 360, 100, 100, 100);
  };

  sketch.draw = () => {
    sketch.background(0,0,100, 80);

    const dist = sketch.dist(sketch.pmouseX, sketch.pmouseY, sketch.mouseX, sketch.mouseY)
    const weight = sketch.constrain(dist, 1, 10)
    const col = sketch.map(weight, 1, 10, 0, 360);
    sketch.strokeWeight(weight);
    sketch.stroke(col, 100, 100)
    sketch.line(sketch.pmouseX, sketch.pmouseY, sketch.mouseX, sketch.mouseY);
  };
};


let data;
const $main = document.querySelector('.main');
const $search = document.querySelector('.header-search__input');

async function init(){

  data = await fetch('./examples.json');
  data = await data.json();

  // initialize with all sections
  createSections(data);

  // p5 sketch
  const myp5 = new p5(s, 'myCanvas');
}

init();

function createGroupedExamples(json, _sectionDiv) {
  Object.keys(json).forEach(exampleName => {
    const group = document.createElement("div");
    group.classList.add("section-list__example");

    const weHeader = document.createElement('h3');
    weHeader.classList.add('section-list__title');
    weHeader.textContent = exampleName.replaceAll('_', ' ');

    group.appendChild(weHeader);

    const weList = document.createElement("ul");
    weList.classList.add(`section-list`);

    group.appendChild(weList);

    json[exampleName].forEach(linkData => {
      const li = document.createElement('li');
      li.classList.add('section-list__item');
      li.innerHTML = `<a href="${linkData.url}">${linkData.type}</a>`;
      weList.appendChild(li);
    })

    _sectionDiv.appendChild(group);
  })

}

function createSections(data) {
  $main.innerHTML = '';
  Object.keys(data).forEach(k => {
    const example = data[k];

    const sectionDiv = document.createElement('section');
    sectionDiv.classList.add(`section`);
    sectionDiv.classList.add(`section-${k.toLowerCase()}`);

    // add a header
    const header = document.createElement("h2");
    header.classList.add(`section-header`);
    header.textContent = k;
    sectionDiv.appendChild(header);

    createGroupedExamples(example, sectionDiv);

    $main.appendChild(sectionDiv)
  })
}

$search.addEventListener('keyup', (e) => {
  const query = e.target.value.trim().toLowerCase();

  if (query === "") {
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
          })
        }
      }
    });
    createSections(matches);
  }
})
