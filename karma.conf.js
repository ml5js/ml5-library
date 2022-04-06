const path = require("path");

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
      // TODO: This is duplication of the webpack.common.babel.js file, but they
      // use different import syntaxes so it's not easy to just require it here.
      // Maybe this could be put into a JSON file, but the include in the module
      // rules is dynamic.
      entry: ["babel-polyfill", "./src/index.js"],
      output: {
        libraryTarget: "umd",
        filename: "ml5.js",
        library: "ml5",
      },
      module: {
        rules: [
          {
            enforce: "pre",
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "eslint-loader",
          },
          {
            test: /\.js$/,
            loader: "babel-loader",
            include: path.resolve(__dirname, "src"),
          },
        ],
      },
      // Don't minify the webpack build for better stack traces
      optimization: {
        minimize: false,
      },
      node: {
        fs: "empty",
      },
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
