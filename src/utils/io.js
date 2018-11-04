// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Save a File
const saveFile = (name, data) => {
  const downloadElt = document.createElement('a');
  downloadElt.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`);
  downloadElt.setAttribute('download', name);
  downloadElt.style.display = 'none';
  document.body.appendChild(downloadElt);
  downloadElt.click();
  document.body.removeChild(downloadElt);
};

const saveBlob = async (data, name, type) => {
  const link = document.createElement('a');
  link.style.display = 'none';
  document.body.appendChild(link);
  const blob = new Blob([data], { type });
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
};

const loadFile = async (path, callback) => fetch(path)
  .then(response => response.json())
  .then((json) => {
    callback(null, json);
    return json;
  })
  .catch((error) => {
    callback(error);
    console.error(`There has been a problem loading the file: ${error.message}`);
    throw error;
  });

export {
  saveFile,
  saveBlob,
  loadFile,
};
