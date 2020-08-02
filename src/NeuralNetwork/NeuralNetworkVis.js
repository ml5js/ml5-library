// import * as tf from '@tensorflow/tfjs';
import * as tfvis from "@tensorflow/tfjs-vis";
// https://js.tensorflow.org/api_vis/latest/#render.barchart

class NeuralNetworkVis {
  constructor() {
    // TODO:
    this.config = {
      height: 300,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  modelSummary(_options, _model) {
    const options = { ..._options };
    tfvis.show.modelSummary(options, _model);
  }

  /**
   * creates a scatterplot from 1 input variable and 1 output variable
   * @param {*} inputLabel
   * @param {*} outputLabel
   * @param {*} data
   */
  scatterplot(inputLabel, outputLabel, data) {
    const values = data.map(item => {
      return {
        x: item.xs[inputLabel],
        y: item.ys[outputLabel],
      };
    });

    const visOptions = {
      name: "debug mode",
    };
    const chartOptions = {
      xLabel: "X",
      yLabel: "Y",
      height: this.config.height,
    };

    tfvis.render.scatterplot(visOptions, values, chartOptions);
  }

  /**
   * creates a scatterplot from all input variables and all output variables
   * @param {*} inputLabels
   * @param {*} outputLabels
   * @param {*} data
   */
  scatterplotAll(inputLabels, outputLabels, data) {
    let values = [];

    inputLabels.forEach(inputLabel => {
      outputLabels.forEach(outputLabel => {
        const val = data.map(item => {
          return {
            x: item.xs[inputLabel],
            y: item.ys[outputLabel],
          };
        });

        values = [...values, ...val];
      });
    });

    const visOptions = {
      name: "debug mode",
    };

    const chartOptions = {
      xLabel: "X",
      yLabel: "Y",
      height: this.config.height,
    };

    tfvis.render.scatterplot(visOptions, values, chartOptions);
  }

  /**
   * creates a barchart from 1 input label and 1 output label
   * @param {*} inputLabel
   * @param {*} outputLabel
   * @param {*} data
   */
  barchart(inputLabel, outputLabel, data) {
    const values = data.map(item => {
      return {
        value: item.xs[inputLabel],
        index: item.ys[outputLabel],
      };
    });

    const chartOptions = {
      xLabel: "label",
      yLabel: "value",
      height: this.config.height,
    };

    console.log(chartOptions);
    // Render to visor
    const surface = {
      name: "Bar chart",
    };
    tfvis.render.barchart(surface, values);
  }

  /**
   * create a confusion matrix
   * @param {*} inputLabels
   * @param {*} outputLabels
   * @param {*} data
   */
  // confusionMatrix(inputLabels, outputLabels, data) {

  // }

  /**
   * Visualize the training of the neural net
   */
  trainingVis() {
    return tfvis.show.fitCallbacks(
      {
        name: "Training Performance",
      },
      ["loss", "accuracy"],
      {
        height: this.config.height,
        callbacks: ["onEpochEnd"],
      },
    );
  }
}

export default NeuralNetworkVis;
