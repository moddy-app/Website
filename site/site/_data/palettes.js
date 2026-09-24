/**
 * Theme colors the site picks from at random on each page load (see
 * partials/random-theme.html). Each seed is turned into a full Material 3
 * theme here, at build time, in light and dark, so the page only has to
 * pick one and apply it before it is painted: no flash, no color math in
 * the browser.
 *
 * Same generation as src/utils/material-color-helpers.ts (SchemeContent),
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

const ROLES = [
  'background', 'onBackground', 'surface', 'surfaceDim', 'surfaceBright',
  'surfaceContainerLowest', 'surfaceContainerLow', 'surfaceContainer',
  'surfaceContainerHigh', 'surfaceContainerHighest', 'onSurface',
  'surfaceVariant', 'onSurfaceVariant', 'inverseSurface', 'inverseOnSurface',
  'outline', 'outlineVariant', 'shadow', 'scrim', 'surfaceTint', 'primary',
  'onPrimary', 'primaryContainer', 'onPrimaryContainer', 'inversePrimary',
  'secondary', 'onSecondary', 'secondaryContainer', 'onSecondaryContainer',
  'tertiary', 'onTertiary', 'tertiaryContainer', 'onTertiaryContainer',
  'error', 'onError', 'errorContainer', 'onErrorContainer',
];

/** onSurfaceVariant -> on-surface-variant, the token names the site uses. */
const kebab = (name) => name.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

module.exports = async function () {
  const {argbFromHex, hexFromArgb, Hct, MaterialDynamicColors, SchemeContent} =
    await import('@material/material-color-utilities');

  const themeString = (seed, isDark) => {
    const scheme = new SchemeContent(Hct.fromInt(argbFromHex(seed)), isDark, 0);
    let css = ':root,:host{';
    for (const role of ROLES) {
      css += `--md-sys-color-${kebab(role)}:${hexFromArgb(MaterialDynamicColors[role].getArgb(scheme))};`;
    }
    return css + '}';
  };

  return SEEDS.map((seed) => ({
    seed,
    light: themeString(seed, false),
    dark: themeString(seed, true),
  }));
};
