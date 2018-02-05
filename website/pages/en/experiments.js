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
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(process.cwd() + '/siteConfig.js');


class Help extends React.Component {
  render() {
    // image is not working.
    const demos = [
      {
        content: "Simple example base on Google's Teachable Machines Project",
        image: siteConfig.baseUrl + "img/teachable.gif",
        title: 'Teachable Machines',
        imageLink: "https://github.com/ITPNYU/ml5-js/tree/master/demos/teachableMachine",
        imageAlign: "left"
      },
      {
        content: 'An experimental web text editor that runs a LSTM model while you write to suggest new lines',
        image: siteConfig.baseUrl + "img/selected_stories.gif",
        title: 'Selected Stories',
        imageLink: "https://cvalenzuela.github.io/Selected_Stories/",
        imageAlign: "left"
      },
      {
        content: 'Machine Learning Pong Game in The Browser',
        image: siteConfig.baseUrl + "img/pongml.jpg",
        title: 'Pong ML',
        imageLink: "https://github.com/matamalaortiz/Pong-ML",
        imageAlign: "left"
      }
    ];

    return (
      <div className="docMainWrapper wrapper">
        <Container className="mainContainer documentContainer postContainer">
          <div className="post" id="experiments">
            <header className="postHeader">
              <h2>Experiments</h2>
            </header>
            <p>A collection of experiments and demos built with ML5.js.</p>
            <GridBlock contents={demos} layout="threeColumn"/>
          </div>
        </Container>
      </div>
    );
  }
}

module.exports = Help;
