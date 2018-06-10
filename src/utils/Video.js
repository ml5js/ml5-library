// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Base Video class that creates
a separate video element with a correct
video size to use with a model
*/

class Video {
  constructor(video, size) {
    this.videoElt = null;
    this.size = size;

    if (video instanceof HTMLVideoElement) {
      this.videoElt = video;
    } else if (typeof video === 'object' && video.elt instanceof HTMLVideoElement) {
      this.videoElt = video.elt; // Handle a p5.js video element
    }
  }

  loadVideo() {
    return new Promise((resolve) => {
      this.video = document.createElement('video');
      this.video.srcObject = this.videoElt.captureStream();
      this.video.width = this.size;
      this.video.height = this.size;
      this.video.autoplay = true;
      this.video.playsinline = true;
      this.video.muted = true;
      resolve();
    });
  }
}

export default Video;
