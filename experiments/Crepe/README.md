
## MARL Crepe model

This code is based on the code https://github.com/marl/crepe (gh-pages branch).

Notes from this demo (from the demo page at https://marl.github.io/crepe/):

This demo works most reliably in the latest versions of Chrome on Windows
and MacOS. There is an issue where TensorFlow.js is not working properly
on Linux versions of Chrome.

A stripped-down model of CREPE is running on this browser,
which has less then 3 percent of papameters. The performance of
this online demo therefore may not be as good as reported
in the <a href="https://arxiv.org/abs/1802.06182">paper</a>,
and it may make more octave errors than the full model.

To run the model with the full capacity, check out the Git repo at
<a href="https://github.com/marl/crepe">https://github.com/marl/crepe</a>
and follow the instructions in README.md.

The model is trained on 16 kHz audio, and due to the imperfect resampling
in the browser, this demo works best when the hardware sample rate is
a multiple of 16000 Hz. Your sample rate is <span id="srate"></span> Hz.
<br>

For further details on this model, please refer to our paper:<br><br>
&nbsp; &nbsp; <a href="https://arxiv.org/abs/1802.06182">
CREPE: A Convolutional Representation for Pitch Estimation</a><br>
&nbsp; &nbsp; Jong Wook Kim, Justin Salamon, Peter Li, Juan Pablo Bello<br>
&nbsp; &nbsp; <i>Proceedings of the IEEE Conference on ICASSP, 2018.</i>