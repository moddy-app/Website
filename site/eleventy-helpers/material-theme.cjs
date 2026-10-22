/**
 * A seed color turned into a full Material 3 theme (SchemeContent), as the
 * CSS the page applies: `:root,:host{--md-sys-color-…}`. Used at build time
 * by site/_data/palettes.js (random themes) and alertTheme.js (/down).
 */

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

module.exports = async function themeFromSeed(seed) {
  const {argbFromHex, hexFromArgb, Hct, MaterialDynamicColors, SchemeContent} =
    await import('@material/material-color-utilities');

  const themeString = (isDark) => {
    const scheme = new SchemeContent(Hct.fromInt(argbFromHex(seed)), isDark, 0);
    let css = ':root,:host{';
    for (const role of ROLES) {
      css += `--md-sys-color-${kebab(role)}:${hexFromArgb(MaterialDynamicColors[role].getArgb(scheme))};`;
    }
    return css + '}';
  };

  return {seed, light: themeString(false), dark: themeString(true)};
};
