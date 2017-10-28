import * as pi from './pi';
import * as hamlet from './text';

window.onload = () => {
  let nextNumberBtn = document.getElementById('nextNumberBtn');
  let piResult = document.getElementById('piResult');
  let writeHamletBtn = document.getElementById('writeHamletBtn');
  let hamletResult = document.getElementById('hamletResult');

  nextNumberBtn.onclick = () => {
    let numbers = pi.predictPi();
    piResult.innerHTML = 3 + ',' + numbers;
  };

  writeHamletBtn.onclick = () => {
    let generatedText = hamlet.generateText();
    hamletResult.innerHTML = generatedText;
  };

};