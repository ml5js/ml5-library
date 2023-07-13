const webpackConfig = require("./webpack.common.babel");

module.exports = config => {
  config.set({
    client: {
      model: config.model,
      jasmine: {
        random: false,
      },
    },
    frameworks: ["jasmine"],
    files: [
      "src/index.js",
      "src/utils/*_test.js",
      `src/${config.model ? config.model : "**"}/*_test.js`,
      `src/${config.model ? config.model : "**"}/**/*_test.js`,
    ],
    preprocessors: {
      "src/index.js": ["webpack"],
      "src/utils/*.js": ["webpack"],
    },
    webpack: {
      ...webpackConfig,
      // Don't minify the webpack build for better stack traces
      optimization: {
        minimize: false,
      }
    },
    webpackMiddleware: {
      noInfo: true,
      stats: "errors-only",
    },
    browserStack: {
      username: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
    },
    captureTimeout: 500000,
    reportSlowerThan: 500,
    browserNoActivityTimeout: 500000,
    customLaunchers: {
      bs_chrome_mac: {
        base: "BrowserStack",
        browser: "chrome",
        browser_version: "latest",
        os: "OS X",
        os_version: "Mojave",
      },
    },
    reporters: ["mocha"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["Chrome"],
    singleRun: false,
    concurrency: Infinity,
  });
};
