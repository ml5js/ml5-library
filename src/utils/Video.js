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
    } else if (typeof video === 'object' && video.elt instanceof HTMLVideoElement) {
      this.videoElt = video.elt;
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
