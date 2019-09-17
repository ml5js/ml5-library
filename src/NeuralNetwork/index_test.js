// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const {
    neuralNetwork
} = ml5;

const NN_DEFAULTS = {
    activation: 'sigmoid'
}


describe('neuralNetwork', () => {
    let nn;

    beforeEach(async () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
        nn = await neuralNetwork();
    });

    it('Should create neuralNetwork with all the defaults', async () => {
        expect(nn.activation).toBe(NN_DEFAULTS.activation);
    });

    // describe('expressions', () => {
    //     it('Should get expressions for Frida', async () => {
    //         const img = await getImage();
    //         await faceapi.detectSingle(img)
    //             .then(results => {
    //                 expect(results.expressions).toEqual(jasmine.any(Object));

    //             })
    //     });
    // });
    
    // describe('landmarks', () => {
    //     it('Should get landmarks for Frida', async () => {
    //         const img = await getImage();
    //         await faceapi.detectSingle(img)
    //             .then(results => {
    //                 expect(results.landmarks).toEqual(jasmine.any(Object));

    //             })
    //     });
    // });
});