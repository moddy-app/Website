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
    // A color picked by hand is kept instead of a random one on each load
    // (see site/_includes/partials/random-theme.html).
    localStorage.setItem('moddy-color-locked', '1');
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

/**
 * Cards leave the screen with rounded corners, each on its own: a card
 * passing under the top bar, or out of the bottom of the window, is clipped
 * at that line with its own corner radius, so what is left of it always
 * looks like a whole card. The footer is only clipped at the top; it runs
 * off the page with a square bottom edge.
 */
function roundCardsAtScreenEdges() {
  const bar = document.querySelector('.page-topbar');
  const selector = '.card, .site-footer-card';
  const radii = new WeakMap<HTMLElement, string>();
  let scheduled = 0;

  const update = () => {
    scheduled = 0;
    const top = bar ? bar.getBoundingClientRect().bottom : 0;
    const bottom = window.innerHeight;
    for (const card of document.querySelectorAll<HTMLElement>(selector)) {
      const box = card.getBoundingClientRect();
      const cutTop = Math.max(0, top - box.top);
      const cutBottom = card.classList.contains('site-footer-card')
        ? 0
        : Math.max(0, box.bottom - bottom);
      if ((!cutTop && !cutBottom) || cutTop >= box.height || cutBottom >= box.height) {
        if (card.style.clipPath) card.style.clipPath = '';
        continue;
      }
      let radius = radii.get(card);
      if (!radius) {
        radius = getComputedStyle(card).borderTopLeftRadius;
        radii.set(card, radius);
      }
      card.style.clipPath = `inset(${cutTop}px 0 ${cutBottom}px 0 round ${radius})`;
    }
  };

  const schedule = () => {
    if (!scheduled) scheduled = requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', () => {
    // Radii change with the breakpoint (32px, 24px on phones).
    for (const card of document.querySelectorAll<HTMLElement>(selector)) {
      radii.delete(card);
    }
    schedule();
  });
  schedule();
}

applyColorThemeListeners();
initializeTheme();
determinePageNavigationAutoMode();
applySmoothScrolling();
roundCardsAtScreenEdges();
