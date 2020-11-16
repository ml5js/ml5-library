# ml5 Utilities


<center>
    <img style="display:block; max-height:20rem" alt="Illustration of hammer and wrench" src="_media/reference__header-utils.png">
</center>


## Description

The ml5 utilities are handy functions that make your life easier when working with data, images, etc.


## Usage

### Methods


***
#### .flipImage()
> Flips an image or video input horizontally and returns the flipped image. Handy for mirroring an image or video.

```js
const flippedImage = ml5.flipImage(input);
```

📥 **Inputs**
* **input**: Optional. A HTMLVideoElement | p5 video element | HTMLImageElement.

📤 **Outputs**

* **Object**: Returns a flipped image.

🌈**Example**

* Assuming you're using ml5 with p5.js:
  ```html
  <html>
    <meta charset="UTF-8" />
    <title>flipImage</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/p5.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/addons/p5.dom.min.js"></script>
    <script src="http://localhost:8080/ml5.js" type="text/javascript"></script>
    <body>
      <script>
        let video;
        function setup() {
          createCanvas(640, 480);
          video = createCapture(VIDEO);
          video.size(640, 480);
          video.hide();
        }

        function draw() {
          const flippedVideo = ml5.flipImage(video);
          image(flippedVideo, 0, 0, width, height);
        }
      </script>
    </body>
  </html>
  ```

***



## Source Code

* [/src/utils/](https://github.com/ml5js/ml5-library/tree/main/src/utils)
