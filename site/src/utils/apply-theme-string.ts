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

  // Update favicon color to match the theme's primary color
  if ((doc as Document).nodeType === 9) {
    const primaryColor = themeString.match(/--md-sys-color-primary:\s*(.+?);/)?.[1]?.trim();
    if (primaryColor) {
      const faviconSvg = `<svg width="190" height="190" viewBox="0 0 190 190" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M142.39 0H94.9335L47.4565 47.4564H0V94.9129H94.9335L142.39 47.4564V0Z" fill="${primaryColor}"/><path d="M94.9335 94.9129L47.4568 142.39V189.846H94.9339L142.39 142.39H189.847V94.9128L94.9335 94.9129Z" fill="${primaryColor}"/></svg>`;
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
