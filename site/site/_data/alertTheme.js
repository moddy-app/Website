/**
 * The fixed themes of /down (`fixedTheme: true` in default.html): the
 * random theme stays out of it, so an outage always reads as one. Red for
 * an incident (the default), orange once the page knows it is a
 * maintenance (src/pages/down-page.ts).
 */
const themeFromSeed = require('../../eleventy-helpers/material-theme.cjs');

module.exports = async () => ({
  incident: await themeFromSeed('#E62117', {vivid: {tone: 48, onTone: 100}}),
  maintenance: await themeFromSeed('#F57C00', {vivid: {tone: 66, onTone: 10}}),
});
