/* eslint-disable import/no-extraneous-dependencies */
require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const Q = require("q");
const { ok } = require("assert");

// TODO: Change branchName if necessary
const branchName = "main";
const branchRef = `?ref=${branchName}`;
const baseUrl = "https://api.github.com/repos/ml5js/ml5-examples/contents";
const clientId = process.env.GITHUB_ID;
const clientSecret = process.env.GITHUB_SECRET;
const editorUsername = process.env.ML5_EXAMPLES_USERNAME;
const personalAccessToken = process.env.EDITOR_API_ACCESS_TOKEN;
const editorApiUrl = process.env.EDITOR_API_URL;
const headers = {
  "User-Agent": "p5js-web-editor/0.0.1",
};

ok(clientId, "GITHUB_ID is required");
ok(clientSecret, "GITHUB_SECRET is required");
ok(editorUsername, "ML5_EXAMPLES_USERNAME is required");
ok(personalAccessToken, "EDITOR_API_ACCESS_TOKEN is required");
ok(editorApiUrl, "EDITOR_API_URL is required");

const githubRequestOptions = {
  url: baseUrl,
  params: {
    client_id: clientId,
    client_secret: clientSecret,
  },
  method: "GET",
  headers
};

const editorRequestOptions = {
  url: `${editorApiUrl}/${editorUsername}`,
  method: "GET",
  headers: {
    ...headers,
    Authorization: `Basic ${Buffer.from(`${editorUsername}:${personalAccessToken}`).toString(
      "base64",
    )}`,
  }
};

console.log("------", editorRequestOptions);
/**
 * ---------------------------------------------------------
 * --------------------- helper functions --------------------
 * ---------------------------------------------------------
 */

/**
 * Execute a GET, POST, or DELETE request to a URL
 */
async function rp(options) {
  const res = await axios.request(options);
  return res.data;
}

/**
 * fatten a nested array
 */
function flatten(list) {
  return list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
}

/**
 * Fetch data for a single HTML/JS file, or return
 * an url to the file's CDN location
 */
async function fetchFileContent(item) {
  const { name } = item;
  const file = { url: item.url };

  // if it is an html or js file
  if ((file.url != null && name.endsWith(".html")) || name.endsWith(".js")) {
    const options = Object.assign({}, githubRequestOptions);
    options.url = `${file.url}`;

    if (options.url !== undefined || options.url !== null || options.url !== "") {
      file.content = await rp(options);
      // NOTE: remove the URL property if there's content
      // Otherwise the p5 editor will try to pull from that url
      if (file.content !== null) delete file.url;
    }

    return file;
    // if it is NOT an html or js file
  }

  if (file.url) {
    const cdnRef = `https://cdn.jsdelivr.net/gh/ml5js/ml5-examples@${branchName}${
      file.url.split(branchName)[1]
    }`;
    file.url = cdnRef;
  }

  return file;
}

/**
 * STEP 1: Get the top level cateogories
 */
async function getCategories() {
  try {
    const options = Object.assign({}, githubRequestOptions);
    options.url = `${options.url}/p5js${branchRef}`;
    const results = await rp(options);

    return results;
  } catch (err) {
    return err;
  }
}

/**
 * STEP 2: Get the examples for each category
 * e.g. Posenet:
 *  - /posenet_image_single
 *  - /posenet_part_selection
 */
async function getCategoryExamples(sketchRootList) {
  const output = [];
  const sketchRootCategories = sketchRootList.map(async categories => {
    // let options = Object.assign({url: `${requestOptions.url}/${categories.path}${branchRef}`}, requestOptions)
    const options = Object.assign({}, githubRequestOptions);
    options.url = `${options.url}${categories.path}${branchRef}`;
    // console.log(options)
    const sketchDirs = await rp(options);

    try {
      const result = flatten(sketchDirs);

      return result;
    } catch (err) {
      return [];
    }
  });

  const sketchList = await Q.all(sketchRootCategories);

  sketchList.forEach(sketch => {
    sketch.forEach(item => {
      if (item.type === "dir") output.push(item);
    });
  });

  return output;
}

/**
 *  STEP 3.1: Recursively get the tree of files for each directory
 *  @param parentObject - one sketch directory object
 */
async function traverseSketchTree(parentObject) {
  const output = Object.assign({}, parentObject);

  if (parentObject.type !== "dir") {
    return output;
  }
  // let options = `https://api.github.com/repos/ml5js/ml5-examples/contents/${sketches.path}${branchRef}`
  const options = Object.assign({}, githubRequestOptions);
  options.url = `${options.url}${parentObject.path}${branchRef}`;

  output.tree = await rp(options);

  output.tree = output.tree.map(file => traverseSketchTree(file));

  output.tree = await Q.all(output.tree);

  return output;
}

/**
 * STEP 3.2: Traverse the sketchtree for all of the sketches
 * @param {*} categoryExamples - all of the categories in an array
 */
async function traverseSketchTreeAll(categoryExamples) {
  const sketches = categoryExamples.map(async sketch => traverseSketchTree(sketch));

  const result = await Q.all(sketches);
  return result;
}

/**
 * Traverse the tree and format into parent child relation
 * @param {*} parentObject
 */
function traverseAndFormat(parentObject) {
  const parent = Object.assign({}, parentObject);

  if (!parentObject.tree) {
    // returns the files
    return {
      name: parent.name,
      url: parent.download_url,
    };
  }

  const subdir = parentObject.tree.map(item => {
    if (!item.tree) {
      // returns the files
      return {
        name: item.name,
        url: item.download_url,
      };
    }

    const feat = {
      name: item.name,
      children: traverseAndFormat(item),
    };
    return feat;
  });
  return subdir;
}

/**
 * Traverse the tree and download all the content,
 * transforming into an object keyed by file/directory name
 * @param {*} projectFileTree
 */
async function traverseAndDownload(projectFileTree) {
  return projectFileTree.reduce(async (previousPromise, item, idx) => {
    const result = await previousPromise;

    if (Array.isArray(item.children)) {
      result[item.name] = {
        files: await traverseAndDownload(item.children),
      };
    } else {
      result[item.name] = await fetchFileContent(item);
    }

    return result;
  }, {});
}

/**
 * STEP 4
 * Take a parent directory and prepare it for injestion!
 * @param {*} sketch
 * @param {*} user
 */
async function formatSketchForStorage(sketch, user) {
  const newProject = {
    name: sketch.name,
    files: {}, // <== add files to this object
  };

  let projectFiles = traverseAndFormat(sketch);
  projectFiles = await traverseAndDownload(projectFiles);
  newProject.files = projectFiles;
  return newProject;
}

/**
 * format all the sketches using the formatSketchForStorage()
 */
function formatSketchForStorageAll(sketchWithItems, user) {
  let sketchList = sketchWithItems.slice(0);

  sketchList = sketchList.map(sketch => formatSketchForStorage(sketch, user));

  return Promise.all(sketchList);
}

/**
 * Fetch a list of all projects from the API
 */
async function getProjectsList() {
  const options = Object.assign({}, editorRequestOptions);
  options.url = `${options.url}/sketches`;

  const results = await rp(options);
  console.log(results);

  return results.sketches;
}

/**
 * Delete a project
 */
async function deleteProject(project) {
  const options = Object.assign({}, editorRequestOptions);
  options.method = "DELETE";
  options.url = `${options.url}/sketches/${project.id}`;

  const results = await rp(options);

  return results;
}

/**
 * Create a new project
 */
async function createProject(project) {
  try {
    const options = Object.assign({}, editorRequestOptions);
    options.method = "POST";
    options.url = `${options.url}/sketches`;
    options.body = project;

    const results = await rp(options);

    return results;
  } catch (err) {
    throw err;
  }
}

/**
 * STEP 6
 * Remove existing projects, then fill the db
 * @param {*} filledProjectList
 * @param {*} user
 */
async function createProjectsInP5User(filledProjectList, user) {
  console.log("Finding existing projects...");

  const existingProjects = await getProjectsList();

  console.log(`Will delete ${existingProjects.length} projects`);

  try {
    await Q.all(existingProjects.map(deleteProject));
    console.log("deleted old projects!");
  } catch (error) {
    console.log("Problem deleting projects");
    console.log(error);
    process.exit(1);
  }

  try {
    const newProjects = filledProjectList.map(async project => {
      console.log(`saving ${project.name}`);
      await createProject(project);
    });
    await Q.all(newProjects);
    console.log(`Projects saved to User: ${editorUsername}!`);
  } catch (error) {
    console.log("Error saving projects");
    console.log(error);
  }
}

/**
 * ---------------------------------------------------------
 * --------------------- main ------------------------------
 * ---------------------------------------------------------
 */

/**
 * MAKE
 * Get all the sketches from the ml5-examples repo
 * Get the p5 examples
 * Dive down into each sketch and get all the files
 * Format the sketch files to be save to the db
 * Delete existing and save
 */
async function make() {
  // Get the categories and their examples
  const categories = await getCategories();
  const categoryExamples = await getCategoryExamples(categories);

  const examplesWithResourceTree = await traverseSketchTreeAll(categoryExamples);
  const formattedSketchList = await formatSketchForStorageAll(examplesWithResourceTree);

  await createProjectsInP5User(formattedSketchList);
  console.log("done!");
  process.exit();
}

/**
 * TEST - same as make except reads from file for testing purposes
 * Get all the sketches from the ml5-examples repo
 * Get the p5 examples
 * Dive down into each sketch and get all the files
 * Format the sketch files to be save to the db
 * Delete existing and save
 */
// eslint-disable-next-line no-unused-vars
async function test() {
  // read from file while testing
  const examplesWithResourceTree = JSON.parse(
    fs.readFileSync("./ml5-examplesWithResourceTree.json"),
  );

  const formattedSketchList = await formatSketchForStorageAll(examplesWithResourceTree);

  await createProjectsInP5User(formattedSketchList);
  console.log("done!");
  process.exit();
}

/**
 * ---------------------------------------------------------
 * --------------------- Run -------------------------------
 * ---------------------------------------------------------
 * Usage:
 * If you're testing, change the make() function to test()
 * ensure when testing that you've saved some JSON outputs to
 * read from so you don't have to make a billion requests all the time
 *
 * $ GITHUB_ID=<....> GITHUB_SECRET=<...> NODE_ENV=development npm run fetch-examples-ml5
 * $ GITHUB_ID=<....> GITHUB_SECRET=<...> npm run fetch-examples-ml5
 */

if (process.env.NODE_ENV === "development") {
  // test()
  make(); // replace with test() if you don't want to run all the fetch functions over and over
} else {
  make();
}
