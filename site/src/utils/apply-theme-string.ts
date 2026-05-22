/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

type WithStylesheet = typeof globalThis & {
  [stylesheetName: string]: CSSStyleSheet | undefined;
};

/**
 * Applies a stringified CSS theme to a document or shadowroot by creating or
 * reusing a constructable stylesheet. It also saves the themeString to
 * localstorage.
 *
 * NOTE: This function is inlined into the head of the document for performance
 * reasons as well as used by material-color-helpers which is lazily loaded. So
 * do not overload this file with slow logic since it will block render.
 *
 * @param doc Document or ShadowRoot to apply theme.
 * @param themeString Stringified CSS of a material theme to apply to the given
 *     document or shadowroot.
 * @param ssName Optional global identifier of the constructable stylesheet and
 *     used to generate the localstorage name.
 */
export function applyThemeString(
  doc: DocumentOrShadowRoot,
  themeString: string,
  ssName = 'material-theme',
) {
  // Get constructable stylesheet
  let sheet = (globalThis as WithStylesheet)[ssName];
  // Create a new sheet if it doesn't exist already and save it globally.
  if (!sheet) {
    sheet = new CSSStyleSheet();
    (globalThis as WithStylesheet)[ssName] = sheet;
    doc.adoptedStyleSheets.push(sheet);
  }

  // Set the color of the URL bar because we are cool like that.
  const surfaceContainer = themeString.match(
    /--md-sys-color-surface-container:(.+?);/,
  )?.[1];
  if (surfaceContainer) {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', surfaceContainer);
  }

  sheet.replaceSync(themeString);
  localStorage.setItem(ssName, themeString);

  // Update favicon color to match the theme's primary color.
  // MD3 primary in light mode sits at tone ~40 (very dark); we lift it to
  // tone ~50-62 so the favicon is vivid and legible on any browser chrome.
  if ((doc as Document).nodeType === 9) {
    const primaryColor = themeString.match(/--md-sys-color-primary:\s*(.+?);/)?.[1]?.trim();
    if (primaryColor) {
      const faviconColor = liftToMidtone(primaryColor);
      const faviconSvg = `<svg width="190" height="190" viewBox="0 0 190 190" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M142.39 0H94.9335L47.4565 47.4564H0V94.9129H94.9335L142.39 47.4564V0Z" fill="${faviconColor}"/><path d="M94.9335 94.9129L47.4568 142.39V189.846H94.9339L142.39 142.39H189.847V94.9128L94.9335 94.9129Z" fill="${faviconColor}"/></svg>`;
      const blob = new Blob([faviconSvg], {type: 'image/svg+xml'});
      const url = URL.createObjectURL(blob);
      const faviconEl = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
      if (faviconEl) {
        const oldUrl = faviconEl.href;
        faviconEl.href = url;
        if (oldUrl.startsWith('blob:')) URL.revokeObjectURL(oldUrl);
      }
    }
  }
}

/**
 * Converts a hex or rgb color string to HSL, clamps lightness to [0.50, 0.62],
 * and returns the adjusted hex string. This keeps the hue vivid while
 * avoiding the near-black primaries that MD3 generates for light themes.
 */
function liftToMidtone(color: string): string {
  let r: number, g: number, b: number;

  const hex = color.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  const rgb = color.match(/rgb\(\s*(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)\s*\)/);

  if (hex) {
    r = parseInt(hex[1], 16) / 255;
    g = parseInt(hex[2], 16) / 255;
    b = parseInt(hex[3], 16) / 255;
  } else if (rgb) {
    r = Number(rgb[1]) / 255;
    g = Number(rgb[2]) / 255;
    b = Number(rgb[3]) / 255;
  } else {
    return color;
  }

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;

  if (l >= 0.5 && l <= 0.62) return color;

  let h = 0;
  let s = 0;
  if (d) {
    s = d / (l > 0.5 ? 2 - max - min : max + min);
    h =
      max === r ? ((g - b) / d + (g < b ? 6 : 0)) / 6
      : max === g ? ((b - r) / d + 2) / 6
      : ((r - g) / d + 4) / 6;
  }

  const tl = l < 0.5 ? 0.5 : 0.62;
  const q = tl < 0.5 ? tl * (1 + s) : tl + s - tl * s;
  const p = 2 * tl - q;

  const hue2rgb = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 0.5) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');

  if (s === 0) {
    const v = toHex(tl);
    return `#${v}${v}${v}`;
  }
  return `#${toHex(hue2rgb(h + 1 / 3))}${toHex(hue2rgb(h))}${toHex(hue2rgb(h - 1 / 3))}`;
}
