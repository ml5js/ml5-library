// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const { objectDetector } = ml5;

describe('ObjectDetector', () => {
    let detector;

    beforeAll(async () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
        detector = await objectDetector('cocossd', () => {});
    });

    it('throws error when a non image is trying to be detected', async () => {
        const notAnImage = 'not_an_image'
        try {
            await detector.detect(notAnImage);
            fail('Error should have been thrown');
        }
        catch (error) {
            expect(error.message).toBe('Detection subject not supported');
        }
    });
});
