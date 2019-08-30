# StyleTransfer


<center>
    <img style="display:block; max-height:20rem" alt="image classification of bird" src="https://via.placeholder.com/150">
</center>


## Description

Style Transfer is a machine learning technique that allows to transfer the style of one image into another one. This is a two step process, first you need to train a model on one particular style and then you can apply this style to another image.

You can train your own images following [this tutorial](/docs/training-styletransfer).

This implementation is heavily based on [fast-style-transfer-deeplearnjs](https://github.com/reiinakano/fast-style-transfer-deeplearnjs) by [Reiichiro Nakano](https://github.com/reiinakano).
The [original TensorFlow implementation](https://github.com/lengstrom/fast-style-transfer) was developed by [Logan Engstrom](https://github.com/lengstrom)

## Quickstart

```js
// Create a new Style Transfer Instance
const style = ml5.styleTransfer("data/myModel/", modelLoaded);

// When the model is loaded
function modelLoaded() {
  console.log("Model Loaded!");
}
// Grab a img element and generate a new image.
style.transfer(document.getElementById("img"), function(err, resultImg) {
  img.src = resultImg.src;
});
```


## Usage

### Initialize

```js
const styletransfer = ml5.styleTransfer(model, ?callback)
// OR
const styletransfer = ml5.styleTransfer(model, ?video, ?callback)
```

#### Parameters
* **model**: The path to Style Transfer model.
* **video**: Optional. A HTML video element or a p5 video element.
* **callback**: Optional. A function to be called once the model is loaded. If no callback is provided, it will return a promise that will be resolved once the model has loaded.
  

### Properties


***
#### .ready
> *Boolean*. Boolean value that specifies if the model has loaded.
***


### Methods


***
#### .transfer()
> Apply style transfer to an input.

```js
styletransfer.transfer(?callback)
// OR
styletransfer.transfer(input, ?callback)
```

📥 **Inputs**

* **input**: A HTML video or image element or a p5 image or video element. If no input is provided, the default is to use the video element given in the constructor.
* **callback**: Optional. A function to run once the model has made the transfer. If no callback is provided, it will return a promise that will be resolved once the model has made the transfer.

📤 **Outputs**

* **Image**: Returns an HTML img element.

***


## Examples

**plain javascript**
* [StyleTransfer_Image]()
* [StyleTransfer_Video]()

**p5.js**
* [StyleTransfer_Image]()
* [StyleTransfer_Video]()

**p5 web editor**
* [StyleTransfer_Image]()
* [StyleTransfer_Video]()

## Demo

No demos yet - contribute one today!

## Tutorials

No tutorials yet - contribute one today!

## Acknowledgements

**Contributors**:
  * Name 1
  * Name 2

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc

## Source Code

* [/src/StyleTransfer/](https://github.com/ml5js/ml5-library/tree/release/src/StyleTransfer)
