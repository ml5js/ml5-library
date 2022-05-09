/* eslint-disable import/no-extraneous-dependencies */
// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { join } from "path";
import merge from "webpack-merge";
import HtmlWebpackPlugin from "html-webpack-plugin";
import common from "./webpack.common.babel";

export const developmentPort = 8080;

export default merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: {
      watch: true,
      directory: join(__dirname, "./dist"),
    },
    allowedHosts: "all",
    port: developmentPort,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "ml5",
    }),
  ],
});
