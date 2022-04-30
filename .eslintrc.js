const p5Globals = require("./p5Globals");
const p5SoundGlobals = require("./p5SoundGlobals");

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
        ml5: false
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
        "new-cap": 0,
        "no-underscore-dangle": 0
      },
    },
    {
      files: ["examples/p5js/**"],
      globals: {
        ml5: false,
        p5: false,
        ...p5Globals,
        ...p5SoundGlobals,
      },
      rules: {
        "no-plusplus": "off",
        "no-unused-vars": ["error", { varsIgnorePattern: "^(setup|draw|preload|mouse[A-Z].*|windowResized)$" }],
        "prefer-template": "off",
        "no-restricted-syntax": "off",
        "prefer-destructuring": "off"
      }
    },
    {
      files: ["**/**_test.js"],
      globals: {
        ml5: false,
      },
    },
  ],
};
