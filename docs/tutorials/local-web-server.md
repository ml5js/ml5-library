# Running a local web server

If you've looked at our [quickstart](/getting-started/) and [introduction to ml5](/getting-started/hello-ml5), you will have dipped your toes into the ml5 universe.

<br/>

A big part of the ml5 project is to create lots of examples as launching points for all your creative project ideas. You can find all of the ml5.js examples at out Github page: [ml5-examples](https://github.com/ml5js/ml5-examples). If you start to explore these examples you can see how the different ml5 functions are used to accomplish different outcomes. We try our best to keep the examples as simple as possible so you can easily start to build your ideas on top of them.

You can check out all the examples running:
> - [on this massive list](https://github.com/ml5js/ml5-examples#examples-index)
> - [on the p5 web editor](https://editor.p5js.org/ml5/sketches)

If you'd like to download the examples and run them locally, download the [ml5-examples github repo](https://github.com/ml5js/ml5-examples) and run a local web server at the root directory (if this sentence sounds foreign to you, see the How-To section below). The fastest way to do this is:

<br/>

with **python3** installed on your computer:
```bash
cd /path/to/ml5-examples
python -m http.server 8081
```

<br/>

with **python2.7** installed on your computer:

```bash
cd /path/to/ml5-examples
python -m SimpleHTTPServer 8081
```

Then open up your web browser to the url: **localhost:8081**

<br/>

Here we set the port number to **8081**, but you can change the port number to something else like **3000** (then: **localhost:3030**), **3001** (then: **localhost:3031**) for example.


## How to: Run examples and develop "locally"

Coming soon! In the meantime, you can watch [CodingTrain - getting set up](https://www.youtube.com/watch?v=UCHzlUiDD10) for a nice intro on getting set up with writing code for the web.
