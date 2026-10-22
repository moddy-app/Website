/**
 * The fixed red theme of /down (`fixedTheme: true` in default.html): the
 * random theme stays out of it, so an outage always reads as one.
 */
const themeFromSeed = require('../../eleventy-helpers/material-theme.cjs');

module.exports = () => themeFromSeed('#C62828');
