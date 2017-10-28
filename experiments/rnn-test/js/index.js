import * as rnn from './rnn';

window.onload = () => {
  let writeBtn = document.getElementById('writeBtn');
  let result = document.getElementById('result');

  writeBtn.onclick = () => {
    result.innerHTML = rnn.generateText()
  };
};