// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Image and Video base class
*/

import { processVideo } from './utils/imageUtilities';

class ImageAndVideo {
  constructor(video, size) {
    this.imageSize = size;
    this.videoReady = false;
    this.onVideoReady = () => {
      this.videoReady = true;
      this.waitingPredictions.forEach(i => this.predict(i.imgToPredict, i.num, i.callback));
    };

    if (video instanceof HTMLVideoElement) {
      this.video = processVideo(video, this.imageSize, this.onVideoReady);
    } else if (typeof video === 'object' && video.elt instanceof HTMLVideoElement) {
      // Handle p5.js video element
      this.video = processVideo(video.elt, this.imageSize, this.onVideoReady);
    }
  }
}

export default ImageAndVideo;
