/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '@material/web/menu/menu.js';
import '../components/theme-changer.js';

// Simple script to handle the drawer theme menu
const themeButton = document.querySelector('#drawer-theme-button');
const themeMenu = document.querySelector('#drawer-theme-menu') as any;

if (themeButton && themeMenu) {
  themeButton.addEventListener('click', () => {
    themeMenu.open = !themeMenu.open;
  });
}
