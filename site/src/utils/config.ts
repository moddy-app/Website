/**
 * @license
 * Copyright 2024 Moddy App
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Configuration file for environment variables and constants
 */

// Declare import.meta.env type
declare global {
  interface ImportMeta {
    env: {
      A_API_KEY: string;
    };
  }
}

// API Configuration
export const API_URL = 'https://api.moddy.app';
export const API_KEY = import.meta.env.A_API_KEY || '';

// Discord OAuth Configuration
export const DISCORD_CLIENT_ID = '1373916203814490194';
export const DISCORD_REDIRECT_URI = `${API_URL}/auth/discord/callback`;
export const DISCORD_SCOPES = 'identify email';
