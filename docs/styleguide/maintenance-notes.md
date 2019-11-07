# Maintenance Guidelines & DevOps (Internal)


***
# Making a ml5 release

## setup:
1. **Admin access** to the ml5 `npm` [account](https://www.npmjs.com/package/ml5) and [two-factor authentication setup](https://docs.npmjs.com/about-two-factor-authentication) for `npm`
2. **Admin access** to the ml5 `github` [account](https://github.com/ml5js/ml5-library)

## Overview:

When doing a release in ml5, the following repositories need to also be updated:
1. ml5js/ml5-library
2. ml5js/ml5-examples
3. ml5js/ml5-website
4. ml5js/ml5-boilerplate

The following **Parts 1 - 4** go through the process of making a new ml5 release.

***
### Part 1: `ml5-library`:
***

1. Create a new branch from `development` with a name that matches the new release version: `v<#>.<#>.<#>` 
   ```sh
   $ (development): git checkout -b v0.4.2
   ```
2. Update the `version` in **package.json** and run the npm scripts to update the `README.md` and the `docs` with the latest version number. Add and commit your changes and push that branch up to `remote`.
  ```sh
   # Step 0: change the version in package.json from 0.4.1 to 0.4.2
   # Step 1: run the script to update your readme
   $ (v0.4.2): npm run update:readme
   # Step 2: run the script to update the docs
   $ (v0.4.2): oldversion=0.4.1 npm run update:docs
   # Step 3: add, commit, and push your changes up
   $ (v0.4.2): git add .
   $ (v0.4.2): git commit -m "bumps version and updates ml5 version number"
   $ (v0.4.2): git push origin v0.4.2
  ```
3. Make a **Pull Request** to merge `v<#>.<#>.<#>` to `development`. Wait for tests to pass. **Squash and merge**.
  ```sh
  # Once you've squashed and merged `v0.4.2` to `development`...
  # Step 1: switch to your development branch and pull in those changes
  $ (v0.4.2): git checkout development
  $ (development): git fetch
  $ (development): git pull
  ```
4. With these changes now in `development` make a new **Pull Request** to merge `development` into `release`. Wait for tests to pass. **Squash and merge**.
  ```sh
  # Once you've squashed and merged `development` to `release`...
  # Step 1: switch to your release branch and pull in those changes
  $ (development): git checkout release
  $ (release): git fetch
  $ (release): git pull
  ```
5. **Install the dependencies** to ensure you've got all the latest dependencies and **Build the library** to prepare for the release.
  ```sh
  $ (release): npm install
  $ (release): npm run build
  ```
6. Publish to **npm**:
  ```sh
  $ (release): npm publish
  # you will be asked for the OTP (one time password)
  # Enter the 6 digit MFA numbers using your authenticator app
  ```
7. Add all of your changes to `gh-pages` to publish the latest docs
   ```sh
  $ (release): git checkout gh-pages
  $ (gh-pages): git merge release
  $ (gh-pages): git push origin gh-pages
  ```
8. Make a new Github Release and Tag the release. Add release notes describing the changes for the new version.

***
### Part 2: `ml5-examples`

In `ml5-examples` the **release** branch is our source of truth. Any fixes or new examples based on the **current ml5 version** will be directly merged into the **release** branch. 

The **development** branch is used in conjunction with the ml5-library **development** branch. What is different from the **release** branch is that all of the `index.html` files have their ml5 set to `localhost:8080` rather than the ml5 CDN.

If we are doing a new release, this means that the new examples and features added to the **development** branch of `ml5-examples` needs to be merged with the **release** branch.

The one thing to note is that the following steps are to handle merge conflicts that arise from running `npm run update:ml5-dev` to convert the ml5 script src.

***
1. Create a new branch from `release` with a name that matches the new release version: `v<#>.<#>.<#>` 
   ```sh
   $ (development): git checkout -b v0.4.2
   ```
2. Update the `version` in **package.json**. Update all of the `localhost` references to the ml5 CDN and create the new examples index.
  ```sh
  # Step 0: change the version in package.json from 0.4.1 to 0.4.2
  # Step 1: update all of the localhost references to from ml5 CDN to localhosy
  $ (v0.4.2): npm run update:ml5-dev
  $ (v0.4.2): git add .
  ```
3. Merge the changes from **release** into `v<#>.<#>.<#>` branch. 
  ```sh
  $ (v0.4.2): git merge development
  ```
4. Make a **Pull Request** to merge `v<#>.<#>.<#>` to `release`. Wait for tests to pass. **Squash and merge**.
  ```sh
  # Once you've squashed and merged `v0.4.2` to `development`...
  # Step 1: switch to your development branch and pull in those changes
  $ (v0.4.2): git checkout release
  $ (release): git fetch
  $ (release): git pull
  ```
5. Add all of your changes to `gh-pages` to publish the latest docs
  ```sh
  $ (release): git checkout gh-pages
  $ (gh-pages): git merge release
  $ (gh-pages): git push origin gh-pages
  ```
6. Merge all the latest changes from **release** to **development** and revert all of the ml5 URLs in `development` back to `localhost`:
  ```sh
  $ (gh-pages): git checkout development
  $ (development): npm run update:ml5
  $ (development): git add .
  $ (development): git merge release 
  # merge 
  $ (development): npm run update:ml5-dev
  $ (development): git add .
  $ (development): git commit -m "sets ml5 to localhost"
  $ (development): git push origin development
  ```
7. Make a new Github Release and Tag the release. Add release notes describing the changes for the new version.

***
### Part 3: `ml5-website`
***
1. Create a new branch from `master` with a name that matches the new release version: `v<#>.<#>.<#>` 
   ```sh
   $ (master): git checkout -b v0.4.2
   ```
2. Update the **version reference** and the **date last updated** in the file `ml5-website/docs/index.md`. Add and commit and push your changes.
   ```sh
   $ (v0.4.2): git add .
   $ (v0.4.2): git commit -m "bumps version"
   $ (v0.4.2): git push origin v0.4.2
   ```
3. On Github: Make a **Pull Request** to merge `v0.4.2` to `master`. Wait for tests to pass, then squash and merge.


***
### Part 4: `ml5-boilerplate`
***
1. Checkout `with-p5` update the version, add and commit your changes, and push up to the remote branch.
   ```sh
   # update the ml5 version to version 0.4.2 in index.html
   $ (with-p5): git add .
   $ (with-p5): git commit -m "bumps version"
   $ (with-p5): git push origin with-p5
   ```
2. Checkout `withoutp5` update the version, add and commit your changes, and push up to the remote branch.
   ```sh
   # update the ml5 version to version 0.4.2 in index.html
   $ (without-p5): git add .
   $ (without-p5): git commit -m "bumps version"
   $ (without-p5): git push origin without-p5
   ```
