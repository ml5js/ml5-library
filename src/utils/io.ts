// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as tf from '@tensorflow/tfjs';
import type { CSVConfig } from '@tensorflow/tfjs-data/src/types';
import axios from "axios";

const saveBlob = async (data: BlobPart, name: string, type: string) => {
  const link = document.createElement('a');
  link.style.display = 'none';
  document.body.appendChild(link);
  const blob = new Blob([data], { type });
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
};

/**
 * Wrapper around saveBlob to handle the common use case of saving JSON.
 * - Stringifies data.
 * - Sets the correct file type.
 * - Conditionally appends the '.json' file extension.
 */
async function saveJSON(data: any, name: string) {
  const fileName = name.toLowerCase().endsWith('.json') ? name : `${name}.json`;
  await saveBlob(JSON.stringify(data), fileName, 'application/json');
}

/**
 * Handles loading data from JSON files and other sources.
 */

/**
 * Load JSON from a file by its URL string using axios.
 */
async function loadJSON(url: string) {
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    throw new Error(`Error loading JSON file from URL ${url}\n${err}`);
  }
}

/**
 * Load CSV from a file by its URL string using tensorflow.
 * Can optionally provide options, which might be useful for extracting xs and ys if the inputs are known.
 */
async function loadCSV(dataUrl: string, csvConfig?: CSVConfig): Promise<tf.TensorContainer[]> {
  try {
    const csvDataset = tf.data.csv(dataUrl, csvConfig);
    return await csvDataset.toArray();
  } catch (err) {
    throw new Error(`Error loading CSV file from URL ${dataUrl}\n${err}`);
  }
}

// TODO: does this work?
async function loadCSVFile(file: File | Blob): Promise<tf.TensorContainer[]> {
  const source = new tf.data.FileDataSource(file);
  const csvDataset = new tf.data.CSVDataset(source);
  return csvDataset.toArray();
}

async function loadJsonFile(file: File | Blob): Promise<any> {
  const fr = new FileReader();
  fr.readAsText(file);
  const text = await file.text();
  return JSON.parse(text);
}

function fileIsType(file: File, extension: string): boolean {
  return file.name.toLowerCase().endsWith(`.${extension}`) ||
    file.type.toLowerCase().includes(extension);
}

/**
 * When using a FileList, assume that the file is in JSON or CSV format.
 */
async function loadDataFromFileList(files: FileList): Promise<any> {
  // TODO: can there be multiple data files?
  const file = files[0];
  if (!file) {
    throw new Error("No files found in FileList");
  }
  if (fileIsType(file, 'csv')) {
    try {
      return await loadCSVFile(file);
    } catch (err) {
      throw new Error(`Error loading CSV file ${file.name}\n${err}`);
    }
  } else {
    if (!fileIsType(file, 'json')) {
      console.warn(`Encountered file ${file.name} with unsupported file type ${file.type}. Expected a CSV or JSON file. Attempting to parse as JSON.`);
    }
    try {
      return await loadJsonFile(file);
    } catch (err) {
      throw new Error(`Error loading JSON file ${file.name}\n${err}`);
    }
  }
}

/**
 * Use axios to resolve a blob URL.
 */
async function loadBlob(url: string): Promise<any> {
  const { data } = await axios.get(url, { responseType: 'blob' });
  // TODO: is it already parsed as JSON?
  // https://stackoverflow.com/questions/59465413/convert-blob-url-to-file-object-with-axios
  try {
    return JSON.parse(data);
  } catch (error) {
    // CSV is only a last-ditch attempt to parse data. JSON is expected.
    try {
      return await loadCSVFile(data);
    } catch (csvError) {
      throw new Error(`Cannot parse Blob data as JSON. Error: ${error?.message}`);
    }
  }
}

/**
 * Loads data from a URL using the appropriate function
 */
async function loadDataFromUrl(dataUrl: string): Promise<any> {
  if (dataUrl.endsWith('.csv')) {
    return loadCSV(dataUrl);
  } else if (dataUrl.endsWith('.json')) {
    return loadJSON(dataUrl);
  } else if (dataUrl.includes('blob')) {
    return loadBlob(dataUrl);
  } else {
    throw new Error('Not a valid data format. Must be CSV or JSON');
  }
}

/**
 * Public load function accepts a URL string or a FileList from an input element.
 */
async function loadFile(filesOrPath: string | FileList): Promise<any> {
  if (typeof filesOrPath === "string") {
    return loadDataFromUrl(filesOrPath);
  } else {
    return loadDataFromFileList(filesOrPath);
  }
}

export {
  saveBlob,
  saveJSON,
  loadFile,
  loadJSON
};
