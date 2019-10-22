const { sentiment } = ml5;

describe('Sentiment', ()=>{
  let model;

  beforeAll(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    model = await sentiment('moviereviews').ready;
  });

  it("Model should be ready",()=> expect(model.ready).toBeTruthy());

  it("Happy has a sentiment score greater than 0.5", ()=>{
    expect(model.predict('Happy').score).toBeGreaterThan(0.5);
  });

  it("Terrible has a sentiment score less than 0.5", ()=>{
    expect(model.predict('Terrible').score).toBeLessThan(0.5);
  });
});
