/**
 * @license
 * Copyright 2024 Moddy App
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Sign-in page logic
 */

import '@material/web/progress/circular-progress.js';
import { signInWithDiscord, verifySession } from '../utils/auth.js';

/**
 * Initialize the sign-in page
 */
async function initSignIn() {
  try {
    // First, check if user is already authenticated
    const session = await verifySession();

    if (session.valid) {
      // User is already authenticated, redirect to home
      window.location.href = '/';
      return;
    }

    // User is not authenticated, start Discord OAuth flow
    await signInWithDiscord();
  } catch (error) {
    console.error('Sign-in error:', error);
    // On error, just redirect to home
    window.location.href = '/';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSignIn);
} else {
  initSignIn();
}
