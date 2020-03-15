# Contributing to ml5.js Examples

This project is still a work in progress, but we encourage everyone to join, propose ideas and help in the development!

# Structure and Syntax

We are trying to keep things as simple as possible. ml5.js aims to make machine learning approachable for a broad audience of artists, creative coders, and students. The library provides access to machine learning algorithms and models in the browser and we try to keeps things simple for everyone.

Each example in this repository is self-contained. Meaning that it can be used with out external dependencies or files. Just the folder where the example live is necessary.

The folders are structure based on examples built with other JavaScript frameworks/libraries. This means we aim to have the following structure:

```
javascript/
p5/
three/
rita/
pixi/
etc..
```

Please refer to [#1](https://github.com/ml5js/ml5-examples/issues/1) (thanks [@dariusk](https://github.com/dariusk)), to see why we settle for this. 


## Organizing Examples of different features

If you're interested to make example, you can organize them as heirarchy like so:

```
/FeatureName
    /Example_1
    /Example_2
```

For example, the `PoseNet` directory contains 3 subdirectories, one for each example.

```
/PoseNet
    /PoseNet_image
    /PoseNet_video
    /PoseNet_webcam
```


# Getting Started

Since all the example are self contained, if you want to contribute by fixing bugs, adding documentation or adding new examples, just start by cloning or [downloading this repository](https://github.com/ml5js/ml5-examples/archive/master.zip):

```bash
git clone https://github.com/ml5js/ml5-examples.git
cd ml5-examples
```

Make some changes, fix bugs and submit a new pull request!

We encourage everyone to contribute to this project. If you have never contributed to open source before this might be a good place to start! Just open a new issue!

## Additional Resources

- [How to Contribute to an Open Source Project on GitHub](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)
- [How to Write an Open Source JavaScript Library](https://egghead.io/courses/how-to-write-an-open-source-javascript-library)

