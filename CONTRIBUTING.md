# How to contribute

This project is still a work in progress, but we encourage everyone to join, propose ideas and help in the development!

## Getting Started 

If you want to help develop this library, here are the steps to get started with:

1. Fork the repository to your account, and then clone it your computer:
```bash
git clone https://github.com/YOURGITHUBHANDLE/p5-deeplearn-js.git
```

2. Install dependencies:

```bash
cd p5-deeplearn-js
npm install
```

3. This project is developed using [webpack](https://webpack.js.org/). Webpack is a module bundler that allows to "bundle" different files into one file. This allows you to write files for specific things and then mix them all together into one single file that you can import in your page. 

  Under the `/src` folder you will see that there are sub-folders for all p5ML methods. You can edit each file individually and then `build` everything into one single library.

  Before `building` the library you can test it. Running this command from the root of the project: 
  ```bash
  npm run start:dev
  ```

  Will output something like this:

  ```bash
  Project is running at http://localhost:8080/
  webpack output is served from /dist/

  Hash: 16b80528bf532975b279
  Version: webpack 2.6.1
  Time: 4905ms
    Asset     Size  Chunks                    Chunk Names
  p5ml.js  1.55 MB       0  [emitted]  [big]  main
  chunk    {0} p5ml.js (main) 1.5 MB [entry] [rendered]
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

  This means the project is actively being 'build' when you change any of the files in the `/src` folder. Any change you make to any file in the `/src` folder will rebuild the `p5ml.js` and the `p5ml.min.js` libraries. 

4. Test it! Create a new folder called `/experiments` in the project's root folder. Create an `index.html` file and add the following:

  ```html
  <!DOCTYPE html>
  <html>
  <head>
    <title>Test</title>
    <script src="../../dist/p5ml.js"></script>
  </head>
  <body>

    <script>

    </script>

  </body>
  </html>
  ```

  This is just a simple `html` file that has a reference to the `p5ML` library. 

  Now open the file `/src/index.js` and modify the first lines:

  ```javascript
  'use strict';
  console.log('p5ML loaded');
  ```
  
  To something like this:

  ```javascript
  'use strict';
  console.log('Hello Test Development!');
  ```

  If you now go to `http://localhost:8080/experiments/index.html` and open the console, you should see `Hello Test Development!`. Now try changing any other file. Webpack will rebuild the library for you so if you reload the `index.html` page you should see your changes.

  5. Once you have test it, you can build the library. Just close the `webpack-dev-server` and run 
  ```bash
  npm run build
  ```

  That should output something very similar to the `webpack-dev-server` but you'll notice that at the end is this line:

  ```bash
  > p5ml@0.0.1 build:min /Users/cristobalvalenzuela/Desktop/sandbox/p5-deeplearn-js
  > uglifyjs dist/p5ml.js -o dist/p5ml.min.js
  ```

  Which means the library was successfully build and minified.

  6. (OPTIONAL) Commit your changes. We are using [commitizen](https://github.com/commitizen/cz-cli) to commit changes. Commitizen is a tool that allows you to specify commit in a more precise way. You can run it instead of your regular `git commit -m 'msg'` with:

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

  7. Push your code and make a pull request!

## Additional Resources

- [How to Contribute to an Open Source Project on GitHub](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)
- [How to Write an Open Source JavaScript Library](https://egghead.io/courses/how-to-write-an-open-source-javascript-library)