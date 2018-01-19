const siteConfig = {
  title: 'p5ML.js',
  tagline: 'A high level javascript library for machine learning.',
  url: 'https://cvalenzuela.github.io',
  baseUrl: '/p5-deeplearn-js/',
  projectName: 'p5-deeplearn-js',
  headerLinks: [
    { doc: 'getting-started', label: 'API' },
    { doc: 'simple-image-classification-example', label: 'Examples' },
    { page: 'experiments', label: 'Experiments' },
    { doc: 'glossary-statistics', label: 'Learn' },
    { href: 'https://github.com/ITPNYU/p5-deeplearn-js', label: 'Code' }
  ],
  /* path to images for header/footer */
  headerIcon: '',
  footerIcon: '',
  favicon: 'img/favicon.png',
  /* colors for website */
  colors: {
    primaryColor: '#f7394f',
    secondaryColor: '#000000',
  },
  // This copyright info is used in /core/Footer.js and blog rss/atom feeds.
  copyright: '',
  organizationName: 'cvalenzuela', // or set an env variable ORGANIZATION_NAME
  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks
    theme: 'solarized-dark',
  },
  scripts: [
    'https://rawgit.com/ITPNYU/p5-deeplearn-js/master/dist/p5ml.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.16/p5.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.16/addons/p5.dom.min.js',
  ],
  // You may provide arbitrary config keys to be used as needed by your template.
  repoUrl: 'https://github.com/cvalenzuela/p5-deeplearn-js',
};

module.exports = siteConfig;
