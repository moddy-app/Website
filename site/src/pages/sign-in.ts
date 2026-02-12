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
    // Extract redirect URL from query parameter if present
    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get('url');

    // First, check if user is already authenticated
    const session = await verifySession();

    if (session.valid) {
      // User is already authenticated, redirect to specified URL or home
      window.location.href = redirectUrl || '/';
      return;
    }

    // User is not authenticated, start Discord OAuth flow
    // Pass the redirect URL to be stored in the OAuth state
    await signInWithDiscord(redirectUrl || undefined);
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
