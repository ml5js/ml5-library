// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
Image and Video base class
*/

class Video {
  /**
   * @property {HTMLVideoElement} [video]
   */

  /**
   * @param {HTMLVideoElement | p5.Video | null | undefined} [video] - Can pass a video
   *  into the constructor of the model in order to run the model on every frame of the video.
   * @param {number | null | undefined} [size] - The size expected by the underlying model.
   *  NOT the size of the current video.  The size will be used to resize the current video.
   */
  constructor(video, size) {
    /**
     * @type {HTMLVideoElement | null}
     */
    this.videoElt = null;
    /**
     * @type {number | null | undefined}
     */
    this.size = size;
    /**
     * @type {boolean}
     */
    this.videoReady = false;

    if (typeof HTMLVideoElement !== 'undefined') {
      if (video instanceof HTMLVideoElement) {
        this.videoElt = video;
      } else if (video !== null && typeof video === 'object' && video.elt instanceof HTMLVideoElement) {
        // Handle p5.js video element
        this.videoElt = video.elt;
      }
    }
  }

  /**
   * Copies the stream from the source video into a new video element.
   * The copied element is set to property `this.video` and is also returned by the function.
   * @returns {Promise<HTMLVideoElement>}
   */
  async loadVideo() {
    let stream;
    return new Promise((resolve, reject) => {
      if (!this.videoElt) {
        reject(new Error('No video was passed to the constructor.'));
      }
      this.video = document.createElement('video');
      const sUsrAg = navigator.userAgent;
      if (sUsrAg.indexOf('Firefox') > -1) {
        stream = this.videoElt.mozCaptureStream();
      } else {
        stream = this.videoElt.captureStream();
      }
      this.video.srcObject = stream;
      if (this.size) {
        this.video.width = this.size;
        this.video.height = this.size;
      }
      this.video.autoplay = true;
      this.video.playsinline = true;
      this.video.muted = true;
      const playPromise = this.video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.videoReady = true;
          resolve(this.video);
        });
      }
    });
  }
}

export default Video;
