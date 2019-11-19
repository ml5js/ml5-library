// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

describe('CocoSsd', () => {
    let cocoSsd;

    async function getRobin() {
        const img = new Image();
        img.crossOrigin = '';
        img.src = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-library@development/assets/bird.jpg';
        await new Promise((resolve) => { img.onload = resolve; });
        return img;
    }

    async function getImageData() {
        const arr = new Uint8ClampedArray(40000);

        // Iterate through every pixel
        for (let i = 0; i < arr.length; i += 4) {
            arr[i + 0] = 0;    // R value
            arr[i + 1] = 190;  // G value
            arr[i + 2] = 0;    // B value
            arr[i + 3] = 255;  // A value
        }

        // Initialize a new ImageData object
        const img = new ImageData(arr, 200);
        return img;
    }

    beforeEach(async () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
        cocoSsd = await objectDetector('CocoSsd');
    });

    it('detects a robin', async () => {
        const robin = await getRobin();
        const detection = await cocoSsd.detect(robin);
        expect(detection[0].label).toBe('bird');
    });

    it('detects takes ImageData', async () => {
        const img = await getImageData();
        const detection = await cocoSsd.detect(img);
        expect(detection).toEqual([]);
    });
});
