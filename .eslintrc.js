const p5Globals = require("./p5Globals");
const p5SoundGlobals = require("./p5SoundGlobals");

module.exports = {
  extends: [
    "airbnb-base",
    "airbnb-typescript/base",
    "prettier"
  ],
  parserOptions: {
    project: "./tsconfig.json"
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  globals: {
    fetch: false,
    document: true,
  },
  rules: {
    "no-console": 0,
    "arrow-body-style": 0,
    "import/no-useless-path-segments": 0,
    "no-constructor-return": 0,
    "no-else-return": 0,
    "@typescript-eslint/default-param-last": 0,
    "prefer-regex-literals": 0,
    "prefer-object-spread": 0,
    "@typescript-eslint/lines-between-class-members": 0
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
        "import/no-extraneous-dependencies": [
          "error",
          {
            "devDependencies": ["**/**_test.js", "**/**.test.js", "setupTests.js"]
          }
        ]
      },
    },
    {
      files: ["**/**_test.js"],
      globals: {
        ml5: false,
      },
    },
    {
      files: ["**/**.test.js"],
      globals: {
        ml5: false,
      },
      env: {
        jest: true,
      }
    },
  ],
};
