// Copyright (c) 2019 ml5
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Style Transfer Image Example
This uses a pre-trained model of The Great Wave off Kanagawa and Udnie (Young American Girl, The Dance)
=== */

const inputImg = document.getElementById('inputImg'); // The image we want to transfer
const statusMsg = document.getElementById('statusMsg'); // The status message
const styleA = document.getElementById('styleA'); // The div container that holds new style image A
const styleB = document.getElementById('styleB'); // The div container that holds new style image B

ml5.styleTransfer('models/wave')
  .then(style1 => style1.transfer(inputImg))
  .then(result => {
    const newImage1 = new Image(250, 250);
    newImage1.src = result.src;
    styleA.appendChild(newImage1);
  });

ml5.styleTransfer('models/udnie')
  .then(style2 => style2.transfer(inputImg))
  .then(result => {
    const newImage2 = new Image(250, 250);
    newImage2.src = result.src;
    styleB.appendChild(newImage2);
    statusMsg.innerHTML = 'Done!';
  });
