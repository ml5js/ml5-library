// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

class P5Util {
    constructor() {
        this.p5Instance = window;
    }

    /**
     * Set p5 instance globally.
     * @param {Object} p5Instance 
     */
    setP5Instance(p5Instance) {
        this.p5Instance = p5Instance;
    }

    /**
     * This function will check if the p5 is in the environment
     * Either it is in the p5Instance mode OR it is in the window 
     * @returns {boolean} if it is in p5 
     */
    checkP5() {
        // typeof this.p5Instance !== 'undefined' && this.p5Instance.p5 && this.p5Instance.p5.Image && typeof this.p5Instance.p5.Image === 'function'
        if (typeof this.p5Instance !== 'undefined' &&
            typeof this.p5Instance.loadImage === 'function' || 
            typeof this.p5Instance.p5 !== 'undefined' &&
            typeof this.p5Instance.p5.Image !== 'undefined' &&
            typeof this.p5Instance.p5.Image === 'function') return true;
        return false
    }

    /**
     * Convert a canvas to Blob
     * @param {HTMLCanvasElement} inputCanvas 
     * @returns {Blob} blob object
     */
    /* eslint class-methods-use-this: ["error", { "exceptMethods": ["getBlob"] }] */
    getBlob(inputCanvas) {
        return new Promise((resolve) => {
            inputCanvas.toBlob((blob) => {
                resolve(blob);
            });
        });
    };

    /**
     * Load image in async way.
     * @param {String} url 
     */
    loadAsync(url) {
        return new Promise((resolve) => {
            this.p5Instance.loadImage(url, (img) => {
                resolve(img);
            });
        });
    };

    /**
     * convert raw bytes to blob object
     * @param {Array} raws 
     * @param {number} x 
     * @param {number} y 
     * @returns {Blob}
     */
    async rawToBlob(raws, x, y) {
        const arr = Array.from(raws)
        const canvas = document.createElement('canvas'); // Consider using offScreenCanvas when it is ready?
        const ctx = canvas.getContext('2d');

        canvas.width = x;
        canvas.height = y;

        const imgData = ctx.createImageData(x, y);
        const { data } = imgData;

        for (let i = 0; i < x * y * 4; i += 1 ) data[i] = arr[i];
        ctx.putImageData(imgData, 0, 0);

        const blob = await this.getBlob(canvas);
        return blob;
    };

    /**
     *  Conver Blob to P5.Image
     * @param {Blob} blob 
     * @param {Object} p5Img
     */
    async blobToP5Image(blob) {
        if (this.checkP5()) {
            const p5Img = await this.loadAsync(URL.createObjectURL(blob));
            return p5Img;
        }
        return null;  
    };

}

const p5Utils = new P5Util();

export default p5Utils;
