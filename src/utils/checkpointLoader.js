import * as tf from '@tensorflow/tfjs';

const MANIFEST_FILE = 'manifest.json';

export default class CheckpointLoader {
  constructor(urlPath) {
    this.urlPath = urlPath;
    if (this.urlPath.charAt(this.urlPath.length - 1) !== '/') {
      this.urlPath += '/';
    }
  }

  loadManifest() {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', this.urlPath + MANIFEST_FILE);
      xhr.onload = () => {
        this.checkpointManifest = JSON.parse(xhr.responseText);
        resolve();
      };
      xhr.onerror = (error) => {
        throw new Error(`${MANIFEST_FILE} not found at ${this.urlPath}. ${error}`);
      };
      xhr.send();
    });
  }

  getCheckpointManifest() {
    if (this.checkpointManifest == null) {
      return new Promise((resolve) => {
        this.loadManifest().then(() => {
          resolve(this.checkpointManifest);
        });
      });
    }
    return new Promise((resolve) => {
      resolve(this.checkpointManifest);
    });
  }

  getAllVariables() {
    if (this.variables != null) {
      return new Promise((resolve) => {
        resolve(this.variables);
      });
    }

    return new Promise((resolve) => {
      this.getCheckpointManifest().then(() => {
        const variableNames = Object.keys(this.checkpointManifest);
        const variablePromises = [];
        for (let i = 0; i < variableNames.length; i += 1) {
          variablePromises.push(this.getVariable(variableNames[i]));
        }
        Promise.all(variablePromises).then((variables) => {
          this.variables = {};
          for (let i = 0; i < variables.length; i += 1) {
            this.variables[variableNames[i]] = variables[i];
          }
          resolve(this.variables);
        });
      });
    });
  }
  getVariable(varName) {
    if (!(varName in this.checkpointManifest)) {
      throw new Error(`Cannot load non-existant variable ${varName}`);
    }
    const variableRequestPromiseMethod = (resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'arraybuffer';
      const fname = this.checkpointManifest[varName].filename;
      xhr.open('GET', this.urlPath + fname);
      xhr.onload = () => {
        if (xhr.status === 404) {
          throw new Error(`Not found variable ${varName}`);
        }
        const values = new Float32Array(xhr.response);
        const tensor = tf.Tensor.make(this.checkpointManifest[varName].shape, { values });
        resolve(tensor);
      };
      xhr.onerror = (error) => {
        throw new Error(`Could not fetch variable ${varName}: ${error}`);
      };
      xhr.send();
    };
    if (this.checkpointManifest == null) {
      return new Promise((resolve) => {
        this.loadManifest().then(() => {
          new Promise(variableRequestPromiseMethod).then(resolve);
        });
      });
    }
    return new Promise(variableRequestPromiseMethod);
  }
}
