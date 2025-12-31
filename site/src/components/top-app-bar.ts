/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '@material/web/focus/md-focus-ring.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';

import type {MdIconButton} from '@material/web/iconbutton/icon-button.js';
import {css, html, LitElement} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';
import {live} from 'lit/directives/live.js';

import {drawerOpenSignal} from '../signals/drawer-open-state.js';
import {inertContentSignal, inertSidebarSignal} from '../signals/inert.js';
import {SignalElement} from '../signals/signal-element.js';
import {moddyLogo} from '../svg/moddy-logo.js';
import {verifySession, getUserInfo, logout, type UserInfo} from '../utils/auth.js';

/**
 * Top app bar of the catalog.
 */
@customElement('top-app-bar')
export class TopAppBar extends SignalElement(LitElement) {
  @state()
  private isAuthenticated = false;

  @state()
  private userInfo: UserInfo | null = null;

  @state()
  private isLoading = true;

  connectedCallback() {
    super.connectedCallback();
    this.checkAuthentication();
  }

  /**
   * Check if user is authenticated and load their info
   */
  private async checkAuthentication() {
    try {
      const session = await verifySession();

      if (session.valid) {
        this.isAuthenticated = true;
        const info = await getUserInfo();
        if (info) {
          this.userInfo = info;
        }
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Toggle user menu
   */
  private toggleUserMenu() {
    const menu = this.shadowRoot?.querySelector('#user-menu') as any;
    if (menu) {
      menu.open = !menu.open;
    }
  }

  /**
   * Handle dashboard navigation
   */
  private handleDashboard() {
    window.location.href = 'https://dashboard.moddy.app';
  }

  /**
   * Handle sign out
   */
  private handleSignOut() {
    const currentUrl = encodeURIComponent(window.location.href);
    window.location.href = `https://api.moddy.app/auth/logout?url=${currentUrl}`;
  }

  render() {
    return html`
      <header>
        <div class="default-content">
          <section class="start">
            <md-icon-button
              toggle
              class="menu-button"
              aria-label-selected="open navigation menu"
              aria-label="close navigation menu"
              aria-expanded=${drawerOpenSignal.value ? 'false' : 'true'}
              title="${!drawerOpenSignal.value
                ? 'Open'
                : 'Close'} navigation menu"
              .selected=${live(!drawerOpenSignal.value)}
              @input=${this.onMenuIconToggle}>
              <md-icon slot="selected">menu</md-icon>
              <md-icon>menu_open</md-icon>
            </md-icon-button>
            <a
              href="/"
              class="logo-link"
              title="Home"
              aria-label="Home">
              ${moddyLogo}
            </a>
          </section>

          <a href="/" id="home-link">
            Moddy App
            <md-focus-ring for="home-link"></md-focus-ring>
          </a>

          <a id="skip-to-main" href="#main-content" tabindex="0">
            Skip to main content
          </a>

          <section class="end">
            ${this.renderAuthSection()}
          </section>
        </div>
        <slot></slot>
      </header>
    `;
  }

  /**
   * Renders the authentication section (Sign In button or user avatar)
   */
  private renderAuthSection() {
    if (this.isLoading) {
      return html``;
    }

    if (this.isAuthenticated && this.userInfo) {
      return html`
        <div class="user-menu-container">
          <md-icon-button
            id="user-menu-button"
            aria-label="User menu"
            title="${this.userInfo.username}"
            @click=${this.toggleUserMenu}>
            ${this.userInfo.avatar_url
              ? html`<img
                  src="${this.userInfo.avatar_url}"
                  alt="${this.userInfo.username}"
                  class="user-avatar" />`
              : html`<md-icon>account_circle</md-icon>`}
          </md-icon-button>
          <md-menu
            id="user-menu"
            anchor="user-menu-button"
            menu-corner="end-start"
            anchor-corner="end-end"
            default-focus="none">
            <div class="user-menu-content">
              <div class="user-menu-header">
                ${this.userInfo.avatar_url
                  ? html`<img
                      src="${this.userInfo.avatar_url}"
                      alt="${this.userInfo.username}"
                      class="user-menu-avatar" />`
                  : html`<md-icon class="user-menu-avatar-icon">account_circle</md-icon>`}
                <div class="user-menu-greeting">Hello @${this.userInfo.username}!</div>
              </div>
              <div class="user-menu-actions">
                <md-filled-button @click=${this.handleDashboard}>
                  <md-icon slot="icon">dashboard</md-icon>
                  Dashboard
                </md-filled-button>
                <md-filled-tonal-button @click=${this.handleSignOut}>
                  <md-icon slot="icon">logout</md-icon>
                  Sign out
                </md-filled-tonal-button>
              </div>
            </div>
          </md-menu>
        </div>
      `;
    }

    return html`
      <md-filled-tonal-button @click=${this.onSignInClick}>
        Sign In
      </md-filled-tonal-button>
    `;
  }

  /**
   * Redirects to the sign in page with the current URL as a parameter.
   */
  private onSignInClick() {
    const currentUrl = encodeURIComponent(window.location.href);
    window.location.href = `/sign-in?url=${currentUrl}`;
  }

  /**
   * Toggles the sidebar's open state.
   */
  private onMenuIconToggle(e: InputEvent) {
    drawerOpenSignal.value = !(e.target as MdIconButton).selected;
  }

  static styles = css`
    :host,
    header {
      display: block;
      height: var(--catalog-top-app-bar-height);
    }

    header {
      position: fixed;
      inset: 0 0 auto 0;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      padding: var(--catalog-spacing-m) var(--catalog-spacing-l);
      background-color: var(--md-sys-color-surface-container);
      color: var(--md-sys-color-on-surface);
      z-index: 12;
    }

    .default-content {
      width: 100%;
      display: flex;
      align-items: center;
    }

    md-icon-button:not(:defined) {
      width: 40px;
      height: 40px;
      display: flex;
      visibility: hidden;
    }

    md-icon-button * {
      display: block;
    }

    a {
      color: var(--md-sys-color-primary);
      font-size: max(var(--catalog-title-l-font-size), 22px);
      font-weight: 700;
      text-decoration: none;
      padding-inline: 2px;
      position: relative;
      outline: none;
      vertical-align: middle;
    }

    .logo-link {
      display: flex;
      align-items: center;
      padding: 0;
      margin-top: -3px;
      height: 32px;
    }

    .logo-link svg {
      width: 32px;
      height: 32px;
      color: var(--md-sys-color-primary);
    }

    .start .menu-button {
      display: none;
    }

    .end {
      flex-grow: 1;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    .user-menu-container {
      position: relative;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    #user-menu-button {
      --md-icon-button-icon-size: 32px;
    }

    .user-menu-content {
      padding: var(--catalog-spacing-l);
      min-width: 280px;
      border-radius: var(--catalog-shape-xl);
    }

    #user-menu {
      --md-menu-container-shape: var(--catalog-shape-xl);
    }

    .user-menu-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--catalog-spacing-m);
      padding-bottom: var(--catalog-spacing-l);
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
    }

    .user-menu-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-menu-avatar-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--md-sys-color-primary);
    }

    .user-menu-greeting {
      font-size: var(--catalog-body-l-font-size);
      font-weight: 700;
      color: var(--md-sys-color-on-surface);
      text-align: center;
    }

    .user-menu-actions {
      display: flex;
      gap: var(--catalog-spacing-s);
      padding-top: var(--catalog-spacing-l);
    }

    .user-menu-actions md-filled-button,
    .user-menu-actions md-filled-tonal-button {
      flex: 1;
    }

    #menu-island {
      position: relative;
    }

    #skip-to-main {
      padding: var(--catalog-spacing-s);
      border-radius: var(--catalog-shape-m);
      background-color: var(--md-sys-color-inverse-surface);
      color: var(--md-sys-color-inverse-on-surface);
      opacity: 0;
      position: absolute;
      pointer-events: none;
    }

    #skip-to-main:focus-visible {
      opacity: 1;
      pointer-events: auto;
    }

    @media (max-width: 1500px) {
      .start .logo-link {
        display: none;
      }

      .start .menu-button {
        display: flex;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'top-app-bar': TopAppBar;
  }
}
