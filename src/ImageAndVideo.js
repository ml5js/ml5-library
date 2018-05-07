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

    if (video instanceof HTMLVideoElement) {
      this.video = processVideo(video, this.imageSize);
    } else if (typeof video === 'object' && video.elt instanceof HTMLVideoElement) {
      // Handle p5.js video element
      this.video = processVideo(video.elt, this.imageSize);
    }
  }
}

export default ImageAndVideo;
