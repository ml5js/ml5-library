# How to Contribute

This project is still a work in progress, but we encourage everyone to join, propose ideas and help in the development!

## Getting Started

If you want to help develop this library, here are the steps to get started:

1. Fork the repository to your account, and then clone it your computer:
  ```bash
  git clone https://github.com/YOURGITHUBHANDLE/ml5-library.git
  ```

2. Install dependencies:

  ```bash
  cd ml5-library
  npm install
  ```

3. This project is developed using [Webpack](https://webpack.js.org/). Webpack is a module bundler that "bundles" different files into one file. This file is usually called a library.

  Under the `/src` folder there are sub-folders for all `ml5` methods. Before building the library, you can check to see everything is working:

  - Run this command from the root of the project:
    ```bash
    npm run start
    ```

    That should output something similar to this:

    ```bash
    Project is running at http://localhost:8080/
    webpack output is served from /

    Hash: 16b80528bf532975b279
    Version: webpack 2.6.1
    Time: 4905ms
      Asset     Size  Chunks                    Chunk Names
    ml5.js  1.55 MB       0  [emitted]  [big]  main
    chunk    {0} ml5.js (main) 1.5 MB [entry] [rendered]
        [9] (webpack)/buildin/global.js 509 bytes {0} [built]
      [191] ./src/index.js 403 bytes {0} [built]
      [192] ./~/babel-polyfill/lib/index.js 833 bytes {0} [built]
      [193] (webpack)-dev-server/client?http://localhost:8080 5.68 kB {0} [built]
      [196] ./src/ImageNet/index.js 5.63 kB {0} [built]
      [198] ./src/Lstm/index.js 7.7 kB {0} [built]
      [200] ./src/NeuralNetwork/index.js 6.8 kB {0} [built]
      [204] ./~/babel-polyfill/~/regenerator-runtime/runtime.js 24.4 kB {0} [built]
      [404] ./~/core-js/shim.js 8.18 kB {0} [built]
      [507] ./~/strip-ansi/index.js 161 bytes {0} [built]
      [509] ./~/url/url.js 23.3 kB {0} [built]
      [511] (webpack)-dev-server/client/overlay.js 3.73 kB {0} [built]
      [512] (webpack)-dev-server/client/socket.js 897 bytes {0} [built]
      [513] (webpack)/hot/emitter.js 77 bytes {0} [built]
      [515] multi (webpack)-dev-server/client?http://localhost:8080 babel-polyfill ./src/index.js 52 bytes {0} [built]
        + 501 hidden modules
    webpack: Compiled successfully.
    ```

    If you see this message, it means the project is actively being built by Webpack's `webpack-dev-server`. Any changes you make to any file in the `/src` folder will automatically rebuild the `ml5.js` and `ml5.min.js` libraries as long as the server continues to run.

4. Develop!

	Run this command from the root of the project:

  ```bash
  npm run manual-test
  ```

  This creates a new folder called `/manual-test` in the project's root folder. Create an `index.html` file inside `/manual-test` and add the following:

  ```html
  <!DOCTYPE html>
  <html>
  <head>
    <title>Test</title>
    <script src="http://localhost:8080/ml5.js"></script>
  </head>
  <body>

    <script>

    </script>

  </body>
  </html>
  ```

  This is just a simple `html` file that has a reference to the `ml5` library.

  Next, open the `/src/index.js` file and add this after the last line:

  ```javascript
  console.log('Hello Test Development!');
  ```

  If you now go to `http://localhost:8080/` and open the console, you should see `Hello Test Development!`. As you make changes, you will simply need to reload the `index.html` page to see them.

5. Once you have finished testing, you can build the library. Just close the `webpack-dev-server` and run

  ```bash
  npm run build
  ```

  That should output something very similar to the `webpack-dev-server` from step 3 but you'll notice at the end is this line:

  ```bash
  > webpack --config webpack.prod.babel.js
  > Done in 15.13s.
  ```

  If you see this, it means the library was successfully built and minified.


6. (OPTIONAL) Commit your changes. We are using [Commitizen](https://github.com/commitizen/cz-cli) to commit changes. Commitizen is a tool that allows you to specify commits in a more precise way. You can run it instead of your regular `git commit -m 'msg'` with:

  ```bash
  npm run commit
  ```

  That will show you an interactive prompt to commit:
  ```bash
  ? Select the type of change that you're committing: (Use arrow keys)
  ❯ feat:     A new feature
    fix:      A bug fix
    docs:     Documentation only changes
    style:    Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
    refactor: A code change that neither fixes a bug nor adds a feature
    perf:     A code change that improves performance
    test:     Adding missing tests or correcting existing tests
  ```

  Just be sure to add files before running commitizen!

7. (OPTIONAL) Push your code and submit a Pull Request!

## Running Unit Tests

WIP

## Additional Resources

- [How to Contribute to an Open Source Project on GitHub](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)
- [How to Write an Open Source JavaScript Library](https://egghead.io/courses/how-to-write-an-open-source-javascript-library)
