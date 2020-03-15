const fs = require('fs');
const path = require('path');
const recursive = require("recursive-readdir");
const { parse } = require('node-html-parser');

const baseurl = path.resolve(__dirname, "..");

const ghUrl = 'https://ml5js.github.io/ml5-examples';
const weUrl = 'https://editor.p5js.org/ml5/sketches';

// Get all the references
const p5Examples = getReferences(`${baseurl}/p5js`, 'p5js', ghUrl, weUrl);
const plainJsExamples = getReferences(`${baseurl}/javascript`, 'javascript', ghUrl);
const d3Examples = getReferences(`${baseurl}/d3`, 'd3', ghUrl);


appendToSource(p5Examples, plainJsExamples);
appendToSource(p5Examples, d3Examples);
console.log(`Created/update examples index json!!`)

// flatten the array to a json where each example parent is the key
let output = {};
p5Examples.forEach(item => {
  output[item.parent] = item.children
});

// write out to file
fs.writeFileSync(`${baseurl}/examples.json`, JSON.stringify(output), 'utf8')


// TODO: functional javascription would be great! 
function appendToSource(_source,_arr){
  // Merge all of these examples to one file
  _arr.forEach(item => {
    const {parent, children} = item;

    // check if it exists
    const match = _source.map( proj => proj.parent ).indexOf(parent);
    if(match >= 0){
      Object.entries(children).forEach( child => {
        const k = child[0];
        const v = child[1];
        _source[match].children[k] = v;
      })
    }
  })
}


function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path+'/'+file).isDirectory();
  });
}

function getReferences(_examplesRoot, _rootName, _ghUrl, _weUrl = null){
  const dirs = getDirectories(_examplesRoot);

  const subdirs = dirs.map(dir => {
      let items = getDirectories(`${_examplesRoot}/${dir}`);

      const ghItems = items.map(item => { 
        return { 
          name: item, 
          url:`${_ghUrl}/${_rootName}/${dir}/${item}`} 
      });

      if(_weUrl !== null){
        const weItems = items.map(item => {
          return {
            name: item,
            url: `${_weUrl}/${item}`
          }
        });

        return {
          parent: dir, 
          children: {
            [_rootName]: ghItems,
            "p5webeditor": weItems
          }}
      } else {
        return {
          parent: dir, 
          children: {
            [_rootName]: ghItems
          }}
      }
      
  });

  return subdirs;
}
