/* eslint-disable import/no-extraneous-dependencies */
// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const ESLintPlugin = require("eslint-webpack-plugin");
const { join } = require("path");

const include = join(__dirname, "src");

module.exports = {
  name: "ml5",
  output: {
    publicPath: "/",
    libraryExport: "default",
    libraryTarget: "umd",
    filename: "ml5.js",
    library: "ml5",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        include,
      },
    ],
  },
  plugins: [
    new ESLintPlugin()
  ],
  resolve: {
    fallback: {
      fs: false,
      util: false
    },
  },
};
