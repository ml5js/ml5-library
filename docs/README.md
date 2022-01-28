# ml5.js - Friendly Machine Learning for the Web

Welcome to the ml5.js documentation. Here you'll find everything you need to get up and started with ml5.

## Getting Started {docsify-ignore}


Take a ride on the Coding Train to watch Dan Shiffman's ["A Beginner's Guide to Machine Learning with ml5.js"](https://www.youtube.com/watch?v=jmznx0Q1fP0). Here Dan explains what ml5.js is and where it all comes from.

ml5.js is machine learning _for the web_ in your web browser. Through some clever and exciting advancements, the folks building [TensorFlow.js](https://www.tensorflow.org/js) figured out that it is possible to use the web browser's built in graphics processing unit (GPU) to do calculations that would otherwise run very slowly using central processing unit (CPU). A really nice explanation of what is happening with GPUs can be found [here - Why are shaders fast?](https://thebookofshaders.com/01/). ml5 strives to make all these new developments in machine learning on the web more approachable for everyone.


### Quickstart

The fastest way to get started exploring the creative possibilities of ml5.js are:

1. If you're interested in using p5.js with ml5.js, you can [start with our boilerplate p5.js web editor sketch](https://editor.p5js.org/ml5/sketches/qqhYX2QmN) or [copy the p5.js + ml5.js boilerplate files from GitHub](https://github.com/ml5js/ml5-library/tree/main/examples/p5js/ml5Boilerplate/ml5Boilerplate_Version).
2. If you're interested in using ml5.js without p5.js, [copy the ml5.js-only boilerplate files from GitHub](https://github.com/ml5js/ml5-library/tree/main/examples/javascript/ml5Boilerplate/ml5Boilerplate_Version). View [this boilerplate code live on our examples site](https://examples.ml5js.org/javascript/ml5Boilerplate/ml5Boilerplate_Version/) to see the expected output.
3. Alternatively, you can copy and paste the CDN link to the ml5.js library:

  ```html
  <script src="https://unpkg.com/ml5@latest/dist/ml5.min.js"></script>
  ```

***
#### Quickstart: Plain JavaScript

Reference the [latest version](https://unpkg.com/ml5@latest/dist/ml5.min.js) of ml5.js using a script tag in an HTML file as below:


In an **index.html** file, copy and paste the following and open up that file in your web browser.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Getting Started with ml5.js</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://unpkg.com/ml5@latest/dist/ml5.min.js"></script>
  </head>

  <body>
    <script>
      // Your code will go here
      // open up your console - if everything loaded properly you should see the correct version number
      console.log('ml5 version:', ml5.version);
    </script>
  </body>
</html>
```

***

***
#### Quickstart: Powered with p5.js

If you're familiar with [p5.js](https://p5js.org/), ml5.js has been designed to play very nicely with p5. You can use the following boilerplate code to get started:


In an **index.html** file, copy and paste the following and open up that file in your web browser.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Getting Started with ml5.js</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- p5 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/p5.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/addons/p5.sound.min.js"></script>
    <!-- ml5 -->
    <script src="https://unpkg.com/ml5@latest/dist/ml5.min.js"></script>
  </head>

  <body>
    <script>
      // Your code will go here
      // open up your console - if everything loaded properly you should see the latest ml5 version
      console.log('ml5 version:', ml5.version);

      function setup() {
        createCanvas(400, 400);
      }

      function draw() {
        background(200);
      }
    </script>
  </body>
</html>
```

***

<br/>



## Join Our Community {docsify-ignore}

We are on [Discord](https://discord.gg/3CVauZMSt7)


## Contribute to ml5.js {docsify-ignore}

ml5 is an open source project that values all contributions. ml5 contributions often take the shape of workshops, design contributions, helping to answer people's questions on Github, flagging bugs in code, fixing bugs, adding new features, and more.

If you'd like to contribute, you're welcome to browse through the issues in our [Github](https://github.com/ml5js/ml5-library/issues) or create a new issue. If you're still unsure of where to start, feel free to ping us at [@ml5js on twitter](https://twitter.com/ml5js), <a href="mailto:hello@ml5js.org">hello@ml5js.org</a>, or join our [Discord](https://discord.gg/3CVauZMSt7)

## Support {docsify-ignore}

ml5 is always on the look out for grants and funding to support the maintenance and development of the ml5 project (including our educational and community based initiatives). If you are an educational institution, grant funding organization, or otherwise interested in funding the ml5 community of students, researchers, artists, educators, designers, and developers, we'd love to hear from you.

Feel free to reach out at <a href="mailto:hello@ml5js.org">hello@ml5js.org</a>.

## Acknowledgements {docsify-ignore}

ml5.js is supported by the time and dedication of open source developers from all over the world. Funding and support is generously provided by a [Google Education grant](https://edu.google.com/why-google/our-commitment/?modal_active=none%2F) at [NYU's ITP/IMA program](https://itp.nyu.edu/).

Many thanks [BrowserStack](https://www.browserstack.com/) for providing testing support.
