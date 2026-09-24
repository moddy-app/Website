/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/menu/menu.js';
import '../components/theme-changer.js';

// The palette button in the footer opens the theme menu (accent color and
// light / dark / auto mode).
const themeButton = document.querySelector('#footer-theme-button');
const themeMenu = document.querySelector('#footer-theme-menu') as
  | (HTMLElement & {open: boolean})
  | null;

if (themeButton && themeMenu) {
  themeButton.addEventListener('click', () => {
    themeMenu.open = !themeMenu.open;
  });
}
