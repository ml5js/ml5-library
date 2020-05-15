const p5Globals = require("./p5Globals");

module.exports = {
  extends: ["airbnb-base", "prettier"],
  globals: {
    fetch: false,
    document: true,
  },
  rules: {
    "no-console": 0,
  },
  env: {
    browser: true,
    jasmine: true,
  },
  overrides: [
    {
      files: ["examples/**"],
      globals: {
        ml5: false,
        ...p5Globals,
      },
      rules: {
        "no-use-before-define": [
          "error",
          {
            functions: false,
            classes: true,
            variables: true,
          },
        ],
      },
    },
  ],
};
