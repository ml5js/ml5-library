/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');
const MarkdownBlock = CompLibrary.MarkdownBlock;
const Container = CompLibrary.Container;

const siteConfig = require(process.cwd() + '/siteConfig.js');


class Help extends React.Component {
  render() {
    // image is not working.
    const demos = [
      {
        content: "Simple example based on Google's Teachable Machines Project",
        image: siteConfig.baseUrl + "img/teachable.gif",
        title: 'Teachable Machines',
        link: "https://itpnyu.github.io/ml5/demos/teachableMachine",
      },
      {
        content: 'An experimental web text editor that runs a LSTM model while you write to suggest new lines',
        image: siteConfig.baseUrl + "img/selected_stories.gif",
        title: 'Selected Stories',
        link: "https://cvalenzuela.github.io/Selected_Stories/",
      },
      {
        content: 'Machine Learning Pong Game in The Browser',
        image: siteConfig.baseUrl + "img/pongml.jpg",
        title: 'Pong ML',
        link: "https://github.com/matamalaortiz/Pong-ML",
      },
      {
        content: 'Recomposing images in the style of other images',
        image: siteConfig.baseUrl + "img/style_transfer.gif",
        title: 'Fast Style Transfer',
        link: "https://yining1023.github.io/fast_style_transfer_in_ML5/",
      },
    ];

    let demoList = [];

    for (let demo of demos) {
      demoList.push(
      <Container className="experiment flex-col">
        <a href={demo.link}><h2>{demo.title}</h2></a>
        <p>{demo.content}</p>
        <a href={demo.link}><img src={demo.image} alt={demo.title}/></a>
      </Container>
      );
    }

    return (
      <div className="docMainWrapper wrapper">
        <Container className="mainContainer documentContainer postContainer">
          <div className="post" id="experiments">
            <header className="postHeader">
              <h1>Experiments</h1>
            </header>
            <p>A collection of experiments and demos built with ML5.js.</p>
            <div className="flex-grid">
              {demoList}
            </div>
          </div>
        </Container>
      </div>
    );
  }
}

module.exports = Help;
