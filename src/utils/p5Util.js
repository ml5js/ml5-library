// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


//This function will check if the p5 is in the environment
const checkP5 = () => {
    if (typeof window !== 'undefined' && window.p5 && window.p5.Image && typeof window.p5.Image === 'function') return true;
    return false;
};

// Convert a bytes-array to a Blob Object
const rawToBlob = async (raws, x, y) => {
    const canvas = document.createElement('canvas'); // Consider using offScreenCanvas when it is ready?
    const ctx = canvas.getContext('2d');

    const imgData = ctx.createImageData(x, y);
    const data = imgData.data;

    for (let i = 0; i < x * y * 4; i ++ ) data[i] = raws[i];
    ctx.putImageData(imgData, 0, 0);

    return await getBlob(canvas);
};

// Conver Blob to P5.Image
const blobToP5Image = async (blob) => {
    if (checkP5()) return await loadAsync(URL.createObjectURL(blob));
    else return null;  
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
        loadImage(url, (img) => {
            resolve(img);
        });
    });
};

export {
    checkP5,
    rawToBlob,
    blobToP5Image
}