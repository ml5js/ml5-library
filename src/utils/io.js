// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import axios from "axios";

const saveBlob = async (data, name, type) => {
  const blob = new Blob([data], { type });
  // No foolproof way to detect node. So try loading what you require.
  // If it quacks like a duck...
  let fs, os, path;
  try{
    fs = require('fs');
    os = require('os');
    path = require('path');
  }catch(_){}

  if(fs && os && path){
    // is node
    const buffer = Buffer.from(await blob.arrayBuffer());
    fs.writeFile(path.join(os.homedir(), "Downloads", name), // assume its named Downloads on all platforms?
                 buffer,
                 () => console.log(`Saved ${name} to Downloads folder.`) );
  }else{
    // is browser
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
  }
};

const loadFile = async (path, callback) => axios.get(path)
  .then(response => response.data)
  .then((json) => {
    if (callback) {
      callback(null, json);
    }
    return json;
  })
  .catch((error) => {
    if (callback) {
      callback(error);
    }
    console.error(`There has been a problem loading the file: ${error.message}`);
    throw error;
  });

export {
  saveBlob,
  loadFile,
};
