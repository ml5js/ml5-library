/* eslint-disable import/no-extraneous-dependencies */
// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import merge from "webpack-merge";
import { resolve } from "path";
import UglifyJSPlugin from "uglifyjs-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import common, { indexEntryWithBabel, developmentPort } from "./webpack.common.babel";

const regexMatchHTMLFiles = /^[^.]+.html$/;
const replaceML5Reference = (content, path) => {
  if (!regexMatchHTMLFiles.test(path)) {
    return content;
  }

  return content
    .toString()
    .replace(
      `http://localhost:${developmentPort}/ml5.js`,
      "https://unpkg.com/ml5@latest/dist/ml5.min.js",
    );
};

const libraryBuildConfig = merge(common, {
  mode: "production",
  devtool: "source-map",
  entry: {
    ml5: indexEntryWithBabel,
    "ml5.min": indexEntryWithBabel,
  },
  output: {
    filename: "[name].js",
  },
  optimization: {
    minimize: true,
    minimizer: [
      new UglifyJSPlugin({
        include: /\.min\.js$/,
        sourceMap: true,
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
    new CopyPlugin([
      {
        from: "examples/",
        transform: (content, path) => replaceML5Reference(content, path),
      },
    ]),
  ],
});

export default [libraryBuildConfig, exampleBuildConfig];
