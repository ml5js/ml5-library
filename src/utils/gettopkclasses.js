// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export default async function getTopKClasses(logits, topK, CLASSES) {
  const values = await logits.data();
  const valuesAndIndices = [];
  for (let i = 0; i < values.length; i += 1) {
    valuesAndIndices.push({
      value: values[i],
      index: i,
    });
  }
  valuesAndIndices.sort((a, b) => b.value - a.value);

  const topkValues = new Float32Array(topK);
  const topkIndices = new Int32Array(topK);
  for (let i = 0; i < topK; i += 1) {
    topkValues[i] = valuesAndIndices[i].value;
    topkIndices[i] = valuesAndIndices[i].index;
  }

  const topClassesAndProbs = [];
  for (let i = 0; i < topkIndices.length; i += 1) {
    topClassesAndProbs.push({
      className: CLASSES[topkIndices[i]],
      probability: topkValues[i],
    });
  }
  return topClassesAndProbs;
}
