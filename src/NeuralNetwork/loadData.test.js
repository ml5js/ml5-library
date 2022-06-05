import loadData from "./loadData";

describe('loadData', () => {
  it('Can load from a JSON file', async () => {
    const data = await loadData('https://raw.githubusercontent.com/ml5js/ml5-library/main/examples/p5js/NeuralNetwork/NeuralNetwork_color_classifier/data/colorData_small.json');
    // Make sure we got all the data.
    expect(data).toHaveLength(348);
    // Make sure we got the right data format.
    expect(data[0]).toHaveProperty('b');
    expect(data[0].b).toBe(33);
  })

  it('Can load from a CSV file', async () => {
    const data = await loadData("https://github.com/ml5js/ml5-library/raw/main/examples/p5js/NeuralNetwork/NeuralNetwork_titanic/data/titanic_cleaned.csv");
    expect(data).toHaveLength(1308);
  })

  // TODO: test more types

  // TODO: test that it gets parsed correctly by the nn
});
