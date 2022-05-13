// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { env } from "@tensorflow/tfjs-core";
import dbscan from "./index";

const DBSCAN_DEFAULTS = {
  eps: 50,
  minPts: 3,
};

describe("DBSCAN", () => {
  let dbscanModel;
  const dataurl =
    "https://raw.githubusercontent.com/asvsfs/ml5-library/dbscan/examples/d3/DBSCAN/DBSCAN_Cluster/data/gaussian2d_1.55clusters.csv";

  beforeAll(async () => {
    jest.setTimeout(10000);
    env().set('IS_BROWSER', false); // Fixes TensorFlow error `ReferenceError: TextEncoder is not defined`
    dbscanModel = await dbscan(dataurl, DBSCAN_DEFAULTS, () => {});
    await dbscanModel.load(dataurl);
  });

  it("Should create dbscan with all the defaults", async () => {
    expect(dbscanModel.config.eps).toBe(DBSCAN_DEFAULTS.eps);
    expect(dbscanModel.config.minPts).toBe(DBSCAN_DEFAULTS.minPts);
  });

  it("dbscanModel dataset : Should have length 300", async () => {
    // await kmeansModel.load(dataurl)
    expect(dbscanModel.dataset.length).toBe(300);
  });
});
