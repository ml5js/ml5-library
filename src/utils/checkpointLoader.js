import * as tf from '@tensorflow/tfjs';

const MANIFEST_FILE = 'manifest.json';

export default class CheckpointLoader {
  constructor(urlPath) {
    this.urlPath = urlPath;
    if (this.urlPath.charAt(this.urlPath.length - 1) !== '/') {
      this.urlPath += '/';
    }
  }

  async loadManifest() {
    try {
      this.checkpointManifest = await (await fetch(this.urlPath + MANIFEST_FILE)).json();
    } catch (e) {
      throw new Error(`${MANIFEST_FILE} not found at ${this.urlPath}. ${e}`);
    }
  }

  async getCheckpointManifest() {
    if (this.checkpointManifest == null) {
      await this.loadManifest();
    }
    return this.checkpointManifest;
  }

  async getAllVariables() {
    if (this.variables != null) {
      return Promise.resolve(this.variables);
    }
    await this.getCheckpointManifest();
    const variableNames = Object.keys(this.checkpointManifest);
    const variablePromises = variableNames.map(v => this.getVariable(v));
    return Promise.all(variablePromises).then((variables) => {
      this.variables = {};
      for (let i = 0; i < variables.length; i += 1) {
        this.variables[variableNames[i]] = variables[i];
      }
      return this.variables;
    });
  }
  getVariable(varName) {
    if (!(varName in this.checkpointManifest)) {
      throw new Error(`Cannot load non-existent variable ${varName}`);
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
