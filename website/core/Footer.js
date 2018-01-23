/*
Page Footer
*/

const React = require('react');

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + 'docs/' + (language ? language + '/' : '') + doc;
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + (language ? language + '/' : '') + doc;
  }

  render() {
    const currentYear = new Date().getFullYear();
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <div>
            <h5>Docs</h5>
            <a href={this.docUrl('getting-started.html')}>
              Getting Started
            </a>
            <a href={this.docUrl('imagenet.html')}>
              API Reference
            </a>
            <a href={this.docUrl('training-models.html')}>
              Training Models
            </a>
          </div>
          <div>
            <h5>Learning</h5>
            <a href={this.docUrl('tutorials.html')}>
              Tutorials
            </a>
            <a href={this.docUrl('glossary-statistics.html')}>
              Glossary
            </a>
            <a href={this.docUrl('resources.html')}>
              Resources
            </a>
          </div>
          <div>
            <h5>Contribute</h5>
            <a href={this.pageUrl('experiments.html')}>
            Experiments
            </a>
            <a href={this.props.config.repoUrl}>Contributing Guide</a>
            <a
              className="github-button"
              href={this.props.config.repoUrl}
              data-icon="octicon-star"
              data-count-href={this.props.config.repoUrl}
              data-show-count={true}
              data-count-aria-label="# stargazers on GitHub"
              aria-label="Star this project on GitHub">
              Star
            </a>
          </div>
        </section>

        <a
          href="https://itp.nyu.edu"
          target="_blank"
          className="fbOpenSource">
          <img
            src={this.props.config.baseUrl + 'img/itp_logo.png'}
            alt="Facebook Open Source"
            width="60"
            height="45"
          />
        </a>
        <section className="copyright">
        This project is currently being maintained at NYU ITP by a community of teachers, residents and students. 
        </section>
      </footer>
    );
  }
}

module.exports = Footer;
