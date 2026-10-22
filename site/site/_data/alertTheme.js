/**
 * The fixed themes of /down (`fixedTheme: true` in default.html): the
 * random theme stays out of it, so an outage always reads as one. Red for
 * an incident (the default), orange once the page knows it is a
 * maintenance (src/pages/down-page.ts).
 */
const themeFromSeed = require('../../eleventy-helpers/material-theme.cjs');

module.exports = async () => ({
  incident: await themeFromSeed('#E62117', {
    vivid: {light: {tone: 48, onTone: 100}, dark: {tone: 62, onTone: 10}},
  }),
  maintenance: await themeFromSeed('#F57C00', {
    vivid: {light: {tone: 66, onTone: 10}, dark: {tone: 74, onTone: 10}},
  }),
});
