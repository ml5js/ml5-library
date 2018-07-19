// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Image and Video base class
*/

class Video {
  constructor(video, size) {
    this.videoElt = null;
    this.size = size;
    this.videoReady = false;

    if (video instanceof HTMLVideoElement) {
      this.videoElt = video;
    } else if (video !== null && typeof video === 'object' && video.elt instanceof HTMLVideoElement) {
      // Handle p5.js video element
      this.videoElt = video.elt;
    }
  }

  async loadVideo() {
    return new Promise((resolve) => {
      this.video = document.createElement('video');
      const stream = this.videoElt.captureStream();
      this.video.srcObject = stream;
      this.video.width = this.size;
      this.video.height = this.size;
      this.video.autoplay = true;
      this.video.playsinline = true;
      this.video.muted = true;
      const playPromise = this.video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          resolve(this.video);
        });
      }
    });
  }
}

export default Video;
