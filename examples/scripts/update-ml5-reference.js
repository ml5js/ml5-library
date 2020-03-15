const fs = require('fs');
const path = require('path');
const recursive = require("recursive-readdir");
const { parse } = require('node-html-parser');

const baseurl = path.resolve(__dirname, "..");

let ml5src;
if(process.env.NODE_ENV && ['development', 'dev', 'DEVELOPMENT'].includes(process.env.NODE_ENV) === true ){
    console.log(`setting src for ${process.env.NODE_ENV}`)
    ml5src = `src="http://localhost:8080/ml5.js" type="text/javascript"`
} else {
    console.log(`setting src for production`)
    ml5src = `src="https://unpkg.com/ml5@latest/dist/ml5.min.js" type="text/javascript"`
}

// run the functions
make("/javascript", ml5src);
make("/p5js", ml5src);
make("/d3", ml5src);

/**
 * Take the relative path to the examples directory and 
 * runs the process
 * @param {*} examplesDir 
 */
function make(examplesDir, ml5src){
    recursive(baseurl + examplesDir, (err, files) => {
        // let indexFiles = []; 
        files.forEach(file => {
            const fileName = file.split('/').pop()
            if(fileName.endsWith('.html')){
                // indexFiles.push(file)
                updateMl5Reference(file, ml5src)
            }
        })
        console.log('🌈 done!')
    })    
}


/**
 * takes the filepath to the index.hml file
 * works the DOM to put in our script
 * @param {*} filePath 
 */
function updateMl5Reference(filePath, ml5src){
    let pos;
    let el = parse(fs.readFileSync(filePath, 'utf8'));
    let scripts = el.querySelectorAll('script')
    let selectedRef = scripts.find((item, idx) => {
        if(item.rawAttrs.includes('ml5')){
            pos = idx;
            return item
        }
    })
    selectedRef.rawAttrs = ml5src
    scripts[pos] = selectedRef;

    fs.writeFileSync(filePath, el, 'utf8');
}