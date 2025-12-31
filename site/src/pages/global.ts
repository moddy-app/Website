/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview This file runs logic across every page in the SSG'd catalog and
 * is loaded top-level as a <script type=module>. So this file handles
 * global client-side logic for shared components (e.g. top-app bar) that can't
 * be run on the server in SSR such as accessing localstorage, media queries,
 * and global scroll listeners.
 */

import {
  changeColor,
  changeColorAndMode,
  changeColorMode,
  getCurrentMode,
  getCurrentSeedColor,
  getCurrentThemeString,
  getLastSavedAutoColorMode,
  isModeDark,
} from '../utils/theme.js';

/**
 * Applies theme-based event listeners such as changing color, mode, and
 * listening to system mode changes.
 */
function applyColorThemeListeners() {
  document.body.addEventListener('change-color', (event) => {
    changeColor(event.color);
  });

  document.body.addEventListener('change-mode', (event) => {
    changeColorMode(event.mode);
  });

  // Listen for system color change and applies the new theme if the current
  // color mode is 'auto'.
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      if (getCurrentMode() !== 'auto') {
        return;
      }

      changeColor(getCurrentSeedColor()!);
    });
}

/**
 * Sets color and mode to '#003BCC' (blue) and 'auto' respectively if there is no
 * material theme saved to localStorage. This is the case in initial navigation
 * to the catalog.
 */
function initializeTheme() {
  if (!getCurrentThemeString()) {
    // Generates a blue primary color theme.
    changeColorAndMode('#003BCC', 'auto');
  }
}

/**
 * Determines whether to update the theme on page navigation if the mode is
 * 'auto'.
 *
 * This is necessary in the edge case where the user has set color mode to
 * 'auto', and the system mode is A. They navigate away from the catalog, and
 * over time the system mode changes to B. When they navigate back to the
 * catalog, the mode may be 'auto', but color theme with mode A is saved instead
 * of B.
 */
function determinePageNavigationAutoMode() {
  if (getCurrentMode() !== 'auto') {
    return;
  }

  const actualColorMode = isModeDark('auto', false) ? 'dark' : 'light';
  const lastSavedAutoColorMode = getLastSavedAutoColorMode();

  if (actualColorMode !== lastSavedAutoColorMode) {
    // Recalculate auto mode with the same theme color.
    changeColorMode('auto');
  }
}

/**
 * Adds smooth scrolling behavior to anchor links
 */
function applySmoothScrolling() {
  // Handle hash navigation on page load
  const scrollToHash = () => {
    if (window.location.hash) {
      // Wait for page to be fully loaded and rendered
      setTimeout(() => {
        const target = document.querySelector(window.location.hash);
        if (target) {
          target.scrollIntoView({behavior: 'smooth', block: 'start'});
        }
      }, 300); // Increased timeout for full page load
    }
  };

  // Try on DOMContentLoaded and on window load for safety
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scrollToHash);
  } else {
    scrollToHash();
  }
  window.addEventListener('load', scrollToHash);

  // Handle clicks on anchor links
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a[href^="#"]');

    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    event.preventDefault();
    const element = document.querySelector(href);

    if (element) {
      element.scrollIntoView({behavior: 'smooth', block: 'start'});
      // Update URL without jumping
      history.pushState(null, '', href);
    }
  });
}

applyColorThemeListeners();
initializeTheme();
determinePageNavigationAutoMode();
applySmoothScrolling();
