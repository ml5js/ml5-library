// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


// This function will check if the p5 is in the environment
const checkP5 = () => {
    if (typeof window !== 'undefined' && window.p5 && window.p5.Image && typeof window.p5.Image === 'function') return true;
    return false;
};

// Convert a canvas to Blob
const getBlob = (inputCanvas) => {
    return new Promise((resolve) => {
        inputCanvas.toBlob((blob) => {
            resolve(blob);
        });
    });
};


// Load Image Async
const loadAsync = (url) => {
    return new Promise((resolve) => {
        /* global loadImage */
        loadImage(url, (img) => {
            resolve(img);
        });
    });
};

// Convert a bytes-array to a Blob Object
const rawToBlob = async (raws, x, y) => {
    const canvas = document.createElement('canvas'); // Consider using offScreenCanvas when it is ready?
    const ctx = canvas.getContext('2d');

    canvas.width = x;
    canvas.height = y;

    const imgData = ctx.createImageData(x, y);
    const [ data ] = imgData;

    for (let i = 0; i < x * y * 4; i += 1 ) data[i] = raws[i];
    ctx.putImageData(imgData, 0, 0);

    const blob = await getBlob(canvas);
    return blob;
};

// Conver Blob to P5.Image
const blobToP5Image = async (blob) => {
    if (checkP5()) {
        const p5Img = await loadAsync(URL.createObjectURL(blob));
        return p5Img;
    }
    return null;  
};

export {
    checkP5,
    rawToBlob,
    blobToP5Image
}
