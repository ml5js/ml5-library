// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import kmeans from './index';

const KMEANS_DEFAULTS = {
  k: 2,
  maxIter: 5,
  threshold: 0.5,
};

describe("kMeans", () => {
  let kmeansModel;
  const dataurl =
    "https://raw.githubusercontent.com/ml5js/ml5-library/main/examples/d3/KMeans/KMeans_GaussianClusterDemo/data/gaussian2d_2clusters.csv";

  beforeAll(async () => {
    jest.setTimeout(10000);
    kmeansModel = await kmeans(dataurl, KMEANS_DEFAULTS, () => {});
    await kmeansModel.load(dataurl);
  });

  it("Should create kmeans with all the defaults", async () => {
    expect(kmeansModel.config.k).toBe(KMEANS_DEFAULTS.k);
    expect(kmeansModel.config.maxIter).toBe(KMEANS_DEFAULTS.maxIter);
    expect(kmeansModel.config.threshold).toBe(KMEANS_DEFAULTS.threshold);
  });

  it("kmeans dataset gaussian 2d: Should have length 200", async () => {
    // await kmeansModel.load(dataurl)
    expect(kmeansModel.dataset.length).toBe(200);
  });

  it("kmeans dataset gaussian 2d: Should have 2 unique centroids", async () => {
    // await kmeansModel.load(dataurl)
    const centroids = kmeansModel.dataset.map(val => val.centroid);
    const unique = [...new Set(centroids)].length;
    expect(unique).toBe(2);
  });
});
