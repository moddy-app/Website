/**
 * @license
 * Copyright 2024 Moddy App
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Sign-in page logic
 */

import { signInWithDiscord, verifySession } from '../utils/auth.js';

/**
 * Initialize the sign-in page
 */
async function initSignIn() {
  const loadingState = document.getElementById('loading-state');
  const errorState = document.getElementById('error-state');
  const errorMessage = document.getElementById('error-message');
  const retryButton = document.getElementById('retry-button');

  // Show error function
  const showError = (message: string) => {
    if (loadingState) loadingState.style.display = 'none';
    if (errorState) errorState.style.display = 'flex';
    if (errorMessage) errorMessage.textContent = message;
  };

  // Retry button handler
  if (retryButton) {
    retryButton.addEventListener('click', () => {
      window.location.reload();
    });
  }

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
    showError(
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred. Please try again.'
    );
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSignIn);
} else {
  initSignIn();
}
