/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Polyfill for SSR - provide minimal document object
if (typeof document === 'undefined') {
  (globalThis as any).document = {
    createComment: () => ({ nodeType: 8, data: '' }),
    createElement: (tag: string) => ({ nodeType: 1, tagName: tag }),
    createTextNode: (text: string) => ({ nodeType: 3, textContent: text }),
  };
}

// This file imports only files that will be SSRd e.g. if you can't SSR a
// component, don't import it here.
import '@material/web/all.js';
import './components/catalog-component-header.js';
import './components/catalog-component-header-title.js';
import './components/nav-drawer.js';
import './components/theme-changer.js';
import './components/top-app-bar.js';
import './components/drag-playground.js';
// 🤫
import '@material/web/labs/item/item.js';
