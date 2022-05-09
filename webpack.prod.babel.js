/* eslint-disable import/no-extraneous-dependencies */
// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import merge from "webpack-merge";
import { resolve } from "path";
import CopyPlugin from "copy-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import common from "./webpack.common.babel";
import { developmentPort } from "./webpack.dev.babel";

const replaceML5Reference = (content, path) => {
  if (path.endsWith('.html')) {
    return content
      .toString()
      .replace(
        `http://localhost:${developmentPort}/ml5.js`,
        "https://unpkg.com/ml5@latest/dist/ml5.min.js",
      );
  }
  return content;
};

const libraryBuildConfig = merge(common, {
  mode: "production",
  devtool: "source-map",
  entry: {
    ml5: "./src/index.js",
    "ml5.min": "./src/index.js",
  },
  output: {
    filename: "[name].js",
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        include: /\.min\.js$/,
        terserOptions: {
          sourceMap: true,
        },
      }),
    ],
  },
});

const exampleBuildConfig = merge(common, {
  name: "examples",
  mode: "production",
  output: {
    path: resolve(__dirname, "dist_examples"),
    publicPath: "/",
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "examples/",
          transform: (content, path) => replaceML5Reference(content, path),
        },
      ],
    }),
  ],
});

export default [libraryBuildConfig, exampleBuildConfig];
