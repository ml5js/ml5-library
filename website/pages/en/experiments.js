/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(process.cwd() + '/siteConfig.js');

class Help extends React.Component {
  render() {
    const demos = [
      {
        content: "Teachable Machines demo",
        title: 'Teachable Machines',
      },
      {
        content: 'A web based text editor with RNN/LSTM capabilities',
        title: 'Selected Stories',
      },
      {
        content: 'Machine Learning Pong Game in The Browser',
        title: 'Pong ML',
      }
    ];

    return (
      <div className="docMainWrapper wrapper">
        <Container className="mainContainer documentContainer postContainer">
          <div className="post">
            <header className="postHeader">
              <h2>Experiments</h2>
            </header>
            <p>A collection of experiments and demos built with p5ML.js</p>
            <GridBlock contents={demos} layout="threeColumn" />
          </div>
        </Container>
      </div>
    );
  }
}

module.exports = Help;
