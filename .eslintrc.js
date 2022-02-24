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
        ml5: false,
        p5: false,
        ...p5Globals,
        ...p5SoundGlobals,
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
        "no-unused-vars": ["error", { varsIgnorePattern: "^setup$|^draw$|^preload$" }],
        "new-cap": 0,
        "no-underscore-dangle": 0,
      },
    },
    {
      files: ["**/**_test.js", "**/**.test.js"],
      globals: {
        ml5: false,
      },
      env: {
        jest: true,
      }
    },
  ],
};
