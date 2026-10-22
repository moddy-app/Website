/**
 * Theme colors the site picks from at random on each page load (see
 * partials/random-theme.html). Each seed is turned into a full Material 3
 * theme here, at build time, in light and dark, so the page only has to
 * pick one and apply it before it is painted: no flash, no color math in
 * the browser.
 *
 * Same generation as src/utils/material-color-helpers.ts (SchemeContent,
 * in eleventy-helpers/material-theme.cjs),
 * so the theme menu in the footer produces the same colors from a seed.
 */

// Vivid seeds with enough chroma to give a real color identity.
const SEEDS = [
  '#003BCC', // Moddy blue
  '#6750A4', // violet
  '#0B8A7A', // teal
  '#D6336C', // raspberry
  '#E8590C', // orange
  '#2F9E44', // green
  '#1C7ED6', // sky
  '#AE3EC9', // orchid
  '#C2255C', // ruby
  '#5C7CFA', // periwinkle
];

const themeFromSeed = require('../../eleventy-helpers/material-theme.cjs');

module.exports = () => Promise.all(SEEDS.map(themeFromSeed));
