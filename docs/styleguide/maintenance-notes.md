# Maintenance Guidelines & DevOps (Internal)

# Making a ml5 release (latest - Jan 21, 2021)

## Before merging in a PR from a contributor:

1. make sure to tag it with one of the following in the PR:
   - SEMVER/patch
     - e.g. `SEMVER/patch`: `0.8.11` would become -> `0.8.12`
   - SEMVER/minor
     - e.g. `SEMVER/minor`: `0.8.11` would become -> `0.9.0`
   - SEMVER/major
     - e.g. `SEMVER/major`: `0.8.11` would become -> `1.0.0`

NOTE: if you are unsure quite likely it will be a `SEMVER/patch` for "...when you make backwards compatible bug fixes.". You can learn more about [Semantic Versioning](https://semver.org/).

## Once we merge the PR to `main`:

1. simply go to the `releases` sidebar >
<img width="1332" alt="Screen Shot 2022-01-21 at 12 58 26 PM" src="https://user-images.githubusercontent.com/3622055/150599297-44e00536-9399-4cc0-be5b-d0b09761d651.png">
2. go to the latest draft and click the edit button
<img width="1332" alt="Screen Shot 2022-01-21 at 12 58 31 PM" src="https://user-images.githubusercontent.com/3622055/150599360-cba6d7ec-44eb-49da-977a-a7de5f071795.png">
3. click: publish the release -- this will trigger a github workflow that will:
   * get the latest tag version
   * update the package.json
   * update the readme with the latest version (pulled from the package.json)
   * run npm install
   * add, commit, and push those changes to `main`
   * build the library
   * and publish to npm


***
# Making a ml5 release (deprecation notice - Jan, 21, 2021 - this is how we made releases prior to the github actions workflow under .github/workflows/publish.yml)

## setup:
1. **Admin access** to the ml5 `npm` [account](https://www.npmjs.com/package/ml5) and [two-factor authentication setup](https://docs.npmjs.com/about-two-factor-authentication) for `npm`
2. **Admin access** to the ml5 `github` [account](https://github.com/ml5js/ml5-library)

## Overview:

1. Create a new branch from `main` with a name that matches the new release version: `v<#>.<#>.<#>` 
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
3. Make a **Pull Request** to merge `v<#>.<#>.<#>` to `main`. Wait for tests to pass. **Squash and merge**.
  ```sh
  # Once you've squashed and merged `v0.4.2` to `development`...
  # Step 1: switch to your development branch and pull in those changes
  $ (v0.4.2): git checkout main
  $ (development): git fetch
  $ (development): git pull
  ```
5. **Install the dependencies**: With these changes now in `main`, we need to ensure you've got all the latest dependencies and **Build the library** to prepare for the release.
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
