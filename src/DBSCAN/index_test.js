// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const { dbscan } = ml5;

const DBSCAN_DEFAULTS = {
  eps: 50,
  minPts: 3,
};

describe("DBSCAN", () => {
  let dbscanModel;
  const dataurl =
    "https://raw.githubusercontent.com/asvsfs/ml5-library/development/examples/dbscan/data/data.csv";

  beforeAll(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    dbscanModel = await dbscan(dataurl, DBSCAN_DEFAULTS, () => {});
    await dbscanModel.load(dataurl);
  });

  it("Should create dbscan with all the defaults", async () => {
    expect(dbscanModel.config.eps).toBe(DBSCAN_DEFAULTS.k);
    expect(dbscanModel.config.minPts).toBe(DBSCAN_DEFAULTS.maxIter);
  });

  it("dbscanModel dataset : Should have length 3000", async () => {
    // await kmeansModel.load(dataurl)
    expect(dbscanModel.dataset.length).toBe(3000);
  });
});
