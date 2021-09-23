# Frequently Asked Questions (FAQ)

### Can I use ml5.js in the [p5 web editor](https://editor.p5js.org)?

Mostly.

A number of the ml5 sketches don't currently work in the p5 web editor due to some of the ways that the editor handles data files and some of the network communication regarding making requests to external data (e.g. the big model files that allow ml5.js to run things like image detection, etc). 

There are lots of developments in the p5 web editor as well as in ml5 to make sure these environments all play nicely together. If something doesn't work in the web editor, the best thing to do is to try and run things locally if possible. See [running a local web server tutorial](/tutorials/local-web-server.md).

Thanks!

### Can I use ml5.js with node.js?

No. Not at the moment.

ml5.js uses TensorFlow.js which uses the browser's GPU to run all the calculations. As a result, all of the ml5.js functionality is based around using the browser GPU. We hope to have ml5.js run in node-js sometime in the near future (especially now that [node support for TensorFlow is a thing](https://www.tensorflow.org/js/guide/nodejs) but the current ml5 setup does not support node.js. We hope to support this in the future.


[For more discussion about node and ml5.js, visit this issue thread.](https://github.com/ml5js/ml5-library/issues/377)


### Can I contribute?

Yes! Absolutely. We welcome all forms of socially and technically driven contributions. No contribution is too small. 

Please contact us at [@ml5js on twitter](https://twitter.com/ml5js), <a href="mailto:hello@ml5js.org">hello@ml5js.org</a>, or [Github](https://github.com/ml5js/ml5-library/issues).

### How can I contribute?

Please refer to the contributor documentation [on Github](https://github.com/ml5js/ml5-library/blob/main/CONTRIBUTING.md).
