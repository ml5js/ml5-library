# Maintenance Guidelines & DevOps (Internal)


***
# Making a ml5 release

## setup:
1. **Admin access** to the ml5 `npm` [account](https://www.npmjs.com/package/ml5) and [two-factor authentication setup](https://docs.npmjs.com/about-two-factor-authentication) for `npm`
2. **Admin access** to the ml5 `github` [account](https://github.com/ml5js/ml5-library)

## Overview:

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
