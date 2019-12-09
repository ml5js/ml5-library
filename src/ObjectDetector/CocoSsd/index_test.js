// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// const { objectDetector } = ml5;

const COCOSSD_DEFAULTS = {
    base: 'lite_mobilenet_v2',
    modelUrl: undefined,
}

describe('objectDetector with cocossd', () => {
    let detector;

    async function getRobin() {
        const img = new Image();
        img.crossOrigin = '';
        img.src = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-library@development/assets/bird.jpg';
        await new Promise((resolve) => {
            img.onload = resolve;
        });
        return img;
    }

    async function getImageData() {
        const arr = new Uint8ClampedArray(40000);

        // Iterate through every pixel
        for (let i = 0; i < arr.length; i += 4) {
            arr[i + 0] = 0; // R value
            arr[i + 1] = 190; // G value
            arr[i + 2] = 0; // B value
            arr[i + 3] = 255; // A value
        }

        // Initialize a new ImageData object
        const img = new ImageData(arr, 200);
        return img;
    }

    describe('cocossd', () => {

        beforeAll(async () => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 500000;
            detector = await ml5.objectDetector('cocossd', COCOSSD_DEFAULTS);
        });


        it('Should instantiate with the following defaults', () => {
            expect(detector.config.base).toBe(COCOSSD_DEFAULTS.base);
            expect(detector.config.modelUrl).toBe(COCOSSD_DEFAULTS.modelUrl);
        });

        it('detects a robin', async () => {
            const robin = await getRobin();
            const detection = await detector.detect(robin);
            expect(detection[0].label).toBe('bird');
        });

        it('detects takes ImageData', async () => {
            const img = await getImageData();
            const detection = await detector.detect(img);
            expect(detection).toEqual([]);
        });


    });

});