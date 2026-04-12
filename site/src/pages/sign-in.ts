/**
 * @license
 * Copyright 2024 Moddy App
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Sign-in page logic
 */

import '@material/web/progress/circular-progress.js';
import { signInWithDiscord, getMe } from '../utils/auth.js';

/**
 * Initialize the sign-in page
 */
async function initSignIn() {
  try {
    // Extract redirect URL from query parameter if present
    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get('url');

    // Check if user is already authenticated
    const user = await getMe();

    if (user) {
      // Already logged in — go to the requested URL or home
      window.location.href = redirectUrl || '/';
      return;
    }

    // Not logged in — redirect to backend Discord OAuth
    signInWithDiscord();
  } catch (error) {
    console.error('Sign-in error:', error);
    window.location.href = '/';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSignIn);
} else {
  initSignIn();
}
