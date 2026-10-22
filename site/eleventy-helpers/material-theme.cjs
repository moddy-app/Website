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

/**
 * `vivid: {light: {tone, onTone}, dark: {tone, onTone}}`: primary and error
 * take the seed's own hue and chroma at `tone`, with text at `onTone`,
 * instead of the scheme's darker tone 40 (light) or pastel tone 80 (dark).
 * For /down, whose red must not read as burgundy or pink.
 */
module.exports = async function themeFromSeed(seed, {vivid} = {}) {
  const {argbFromHex, hexFromArgb, Hct, MaterialDynamicColors, SchemeContent} =
    await import('@material/material-color-utilities');

  const themeString = (isDark) => {
    const scheme = new SchemeContent(Hct.fromInt(argbFromHex(seed)), isDark, 0);
    let css = ':root,:host{';
    const colors = Object.fromEntries(
      ROLES.map((role) => [role, hexFromArgb(MaterialDynamicColors[role].getArgb(scheme))]),
    );
    if (vivid) {
      const source = Hct.fromInt(argbFromHex(seed));
      const {tone, onTone} = vivid[isDark ? 'dark' : 'light'];
      const strong = hexFromArgb(Hct.from(source.hue, source.chroma, tone).toInt());
      const on = hexFromArgb(Hct.from(source.hue, 0, onTone).toInt());
      Object.assign(colors, {primary: strong, onPrimary: on, error: strong, onError: on});
    }
    for (const role of ROLES) {
      css += `--md-sys-color-${kebab(role)}:${colors[role]};`;
    }
    return css + '}';
  };

  return {seed, light: themeString(false), dark: themeString(true)};
};
