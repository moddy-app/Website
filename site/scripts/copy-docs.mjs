/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {cp, mkdir, readdir, readFile, writeFile} from 'fs/promises';
import {dirname, join, relative} from 'path';
import tinyGlob from 'tiny-glob';

/**
 * Recursively copies the images from
 *
 * /docs/${path}/images
 * to
 * /catalog/site/${includedPath}/${path}/images
 *
 * @param {string?} path The directory from which to copy the `images/`
 *     directory
 * @param {string?} includedPath A path to include to the beginning of the
 *     destination in the `site` directory
 */
async function copyImages(path = '', includePath = '') {
  const origin = join('..', 'docs', path, 'images');
  const desination = join('site', includePath, path, 'images');

  console.log(`Copying images from ${origin} to ${desination}...`);
  await cp(origin, desination, {recursive: true}, (err) => {
    if (err) throw err;
  });

  console.log(`Copied images from ${origin} to ${desination}!`);
}

/**
 * Finds and returns all the filepaths of markdown files in
 * /docs/components/
 *
 * @return A promise of all the markdwon filepaths in /docs/components/
 */
async function getReadmeFiles(path = '', deep = false) {
  const readmeFilesGlob = [join('../docs', path, deep ? '/**/' : '', '*.md')];
  const readmeFiles = readmeFilesGlob.map(async (entry) => tinyGlob(entry));
  return (await Promise.all(readmeFiles)).flat();
}

/**
 * Transforms to apply to the markdown files
 */
const transforms = [
  // catalog-only code comments are removed
  {
    before: /<!-- catalog-only-start -->(\n)*?<!--\s*/gm,
    after: '',
  },
  {
    before: /\s*-->(\n)*?<!-- catalog-only-end -->/gm,
    after: '',
  },
  // removes everything in between github-only-start and github-only-end
  // comments
  {
    before: /\s*<!-- no-catalog-start -->(.|\n)*?<!-- no-catalog-end -->\s*/gm,
    after: '\n\n',
  },
  // eleventy pages end with `/` so `components/checkbox.md` will turn into the
  // url `/components/checkbox`. Thus we need to transform the relative
  // `./images` links to `../images`.
  {
    before: /images\//gm,
    after: '../images/',
  },
];

/**
 * Executes the `<!-- catalog-include "..." -->` file transform by fetching the
 * file in quotes and simply injecting its contents into the Markdown.
 *
 * @param {string} filepath The filepath of the markdown file to transform. Used
 *     for determining relative URLs.
 * @param {string} fileContents The contents of the markdown filepath to
 *     transform.
 * @return The stringified transformed contents of the markdown file.
 */
async function fileIncludeTransform(filepath, fileContents) {
  const catalogIncludeRegex = /<!--\s?catalog-include "(.+)"\s?-->/g;
  const matches = [];
  let match = catalogIncludeRegex.exec(fileContents);

  // Collect all the regex matches
  while (match) {
    matches.push(match);
    match = catalogIncludeRegex.exec(fileContents);
  }

  const fileDir = dirname(filepath);

  // Iterate through the regex matches backward and splice in the file contents.
  // Iterating backwards so that injecting won't affect match string indices.
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    const matchedString = match[0];
    const includePath = match[1];

    console.log(`Injecting ${includePath} file contents into ${filepath}...`);
    const includeContents = await readFile(join(fileDir, includePath), 'utf8');

    fileContents = fileContents.slice(0, match.index) + includeContents +
        fileContents.slice(match.index + matchedString.length);
  }

  return fileContents;
}

/**
 * Applies the transforms to readme files at the given filepaths and outputs the
 * result to /catalog/site/components/<component-name>.md
 *
 * @param {Array<string>} filepaths The readme file paths to transform.
 * @param {[string|RegExp, string|(match: string, ...patterns: string[])][]}
 *     replacements File path transforms to apply to output.
 */
async function transformReadmes(filepaths, outdir = '', replacements = []) {
  const readmePromises = filepaths.map(async (entry) => {
    let readme = await readFile(entry, 'utf8');
    console.log(`Transforming ${entry}`);

    transforms.forEach((transform) => {
      readme = readme.replaceAll(transform.before, transform.after);
    });

    readme = await fileIncludeTransform(entry, readme);

    // The `components/<component-name>.md` path.
    let localPath = relative(join('..', 'docs'), entry);

    for (const [pattern, replacement] of replacements) {
      const regex = new RegExp(pattern);
      localPath = localPath.replace(regex, replacement);
    }


    // The output path at
    // /catalog/site/components/<?local path>/<component name>.md
    const outputPath = join('site', outdir, localPath);

    console.log(`Writing trasnformed file to: ${outputPath}`);
    // Create the directory if it doesn't exist
    await mkdir(dirname(outputPath), {recursive: true});
    return writeFile(outputPath, readme);
  });

  await Promise.all(readmePromises);
}

// Get all subdirectories in /docs/
async function getSubdirectories(basePath) {
  try {
    const entries = await readdir(join('..', basePath), {withFileTypes: true});
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch (err) {
    return [];
  }
}

// Create config JSON file for a section
async function createSectionConfig(sectionName) {
  const configPath = join('site', sectionName, `${sectionName}.json`);
  const config = {
    layout: 'layouts/docs.html',
    tags: sectionName,
    hasToc: true,
  };

  console.log(`Creating config file: ${configPath}`);
  await mkdir(dirname(configPath), {recursive: true});
  await writeFile(configPath, JSON.stringify(config, null, 2));
}

// Process files from /docs/ root into 'about' section
const aboutFiles = await getReadmeFiles('.');
console.log('Transforming about files...');
await createSectionConfig('about');
await transformReadmes(aboutFiles, 'about');

// Automatically process all subdirectories
const subdirs = await getSubdirectories('docs');
console.log(`Found subdirectories: ${subdirs.join(', ')}`);

for (const subdir of subdirs) {
  const subdirFiles = await getReadmeFiles(subdir, false);
  if (subdirFiles.length > 0) {
    const sectionName = subdir.toLowerCase();
    console.log(`Transforming ${subdir} files...`);
    await createSectionConfig(sectionName);
    await transformReadmes(subdirFiles, sectionName, [
      [new RegExp(`${subdir}/`, 'g'), ''],
    ]);
  }
}

console.log('Transformations complete!');
