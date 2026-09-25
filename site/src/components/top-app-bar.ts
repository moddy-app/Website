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
import '@material/web/divider/divider.js';

import {css, html, LitElement} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';

import {SignalElement} from '../signals/signal-element.js';
import {moddyLogo} from '../svg/moddy-logo.js';
import {getMe, logout, getAvatarUrl, type User} from '../utils/auth.js';
import {API_URL} from '../utils/config.js';

/**
 * Top app bar of the catalog.
 */
/**
 * Text shown by the top app bar. The page passes the translated strings as a
 * JSON `labels` attribute (see site/_data/i18n); English is the fallback.
 */
export interface TopAppBarLabels {
  home: string;
  skipToMain: string;
  signIn: string;
  userMenu: string;
  dashboard: string;
  premium: string;
  planFree: string;
  planMax: string;
  signOut: string;
}

const DEFAULT_LABELS: TopAppBarLabels = {
  home: 'Home',
  skipToMain: 'Skip to main content',
  signIn: 'Sign In',
  userMenu: 'User menu',
  dashboard: 'Dashboard',
  premium: 'Moddy Max',
  planFree: 'Free plan',
  planMax: 'Moddy Max active',
  signOut: 'Sign out',
};

@customElement('top-app-bar')
export class TopAppBar extends SignalElement(LitElement) {
  @state()
  private isAuthenticated = false;

  @state()
  private userInfo: User | null = null;

  @state()
  private isLoading = true;

  /** Whether the user has Moddy Max; null until known. */
  @state()
  private hasMax: boolean | null = null;

  @property({type: Object}) labels: Partial<TopAppBarLabels> = {};

  /** Where the logo leads: the home page in the current language. */
  @property({attribute: 'home-href'}) homeHref = '/';

  /** The Moddy Max page in the current language. */
  @property({attribute: 'premium-href'}) premiumHref = '/premium/';

  private get text(): TopAppBarLabels {
    return {...DEFAULT_LABELS, ...this.labels};
  }

  connectedCallback() {
    super.connectedCallback();
    this.checkAuthentication();
  }

  /**
   * Check if user is authenticated and load their info
   */
  private async checkAuthentication() {
    try {
      const user = await getMe();
      if (user) {
        this.isAuthenticated = true;
        this.userInfo = user;
        this.checkSubscription();
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Loads whether the user has Moddy Max, for the line under their name.
   */
  private async checkSubscription() {
    try {
      const response = await fetch(`${API_URL}/stripe/subscription`, {
        credentials: 'include',
      });
      if (!response.ok) return;
      const subscription = await response.json();
      this.hasMax = Boolean(subscription?.is_active);
    } catch {
      // The line stays empty; the menu works without it.
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
   * Handle sign out
   */
  private async handleSignOut() {
    await logout();
    window.location.href = '/';
  }

  render() {
    return html`
      <header>
        <div class="default-content">
          <section class="start">
            <a
              href=${this.homeHref}
              class="logo-link"
              title=${this.text.home}
              aria-label=${this.text.home}>
              ${moddyLogo}
            </a>
          </section>

          <a id="skip-to-main" href="#main-content" tabindex="0">
            ${this.text.skipToMain}
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
      const avatar = getAvatarUrl(this.userInfo.user_id, this.userInfo.avatar);
      return html`
        <div class="user-menu-container">
          <md-icon-button
            id="user-menu-button"
            aria-label=${this.text.userMenu}
            title="${this.userInfo.username}"
            @click=${this.toggleUserMenu}>
            <img
              src="${avatar}"
              alt="${this.userInfo.username}"
              class="user-avatar" />
          </md-icon-button>
          <md-menu
            id="user-menu"
            anchor="user-menu-button"
            menu-corner="start-end"
            anchor-corner="end-end"
            y-offset="8"
            default-focus="none">
            <div class="user-card">
              <img
                src="${avatar}"
                alt=""
                class="user-menu-avatar" />
              <div class="user-card-text">
                <span class="user-name">${this.userInfo.username}</span>
                ${this.hasMax === null
                  ? html`<span class="user-plan">&nbsp;</span>`
                  : html`<span class="user-plan ${this.hasMax ? 'max' : ''}">
                      ${this.hasMax ? this.text.planMax : this.text.planFree}
                    </span>`}
              </div>
            </div>
            <md-menu-item href="https://dashboard.moddy.app" target="_blank">
              <md-icon slot="start">dashboard</md-icon>
              <div slot="headline">${this.text.dashboard}</div>
              <md-icon slot="end" class="external">open_in_new</md-icon>
            </md-menu-item>
            <md-menu-item href=${this.premiumHref}>
              <md-icon slot="start">diamond</md-icon>
              <div slot="headline">${this.text.premium}</div>
            </md-menu-item>
            <md-divider role="separator" tabindex="-1"></md-divider>
            <md-menu-item class="sign-out" @click=${this.handleSignOut}>
              <md-icon slot="start">logout</md-icon>
              <div slot="headline">${this.text.signOut}</div>
            </md-menu-item>
          </md-menu>
        </div>
      `;
    }

    return html`
      <md-filled-tonal-button @click=${this.onSignInClick}>
        ${this.text.signIn}
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

  static styles = css`
    :host,
    header {
      display: block;
      height: var(--catalog-top-app-bar-height);
    }

    header {
      position: fixed;
      top: var(--site-banner-height, 0px);
      right: 0;
      bottom: auto;
      left: 0;
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
      font-weight: 600;
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
      height: 36px;
    }

    .logo-link svg {
      height: 36px;
      width: auto;
      color: var(--md-sys-color-primary);
    }

    .start {
      display: flex;
      align-items: center;
      gap: 4px;
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

    #user-menu {
      --md-menu-container-color: var(--md-sys-color-surface-container-lowest);
      --md-menu-container-shape: 24px;
      --md-menu-top-space: 8px;
      --md-menu-bottom-space: 8px;
      --md-menu-item-one-line-container-height: 48px;
      --md-menu-item-label-text-font: inherit;
      --md-menu-item-label-text-weight: 500;
      --md-menu-item-leading-icon-color: var(--md-sys-color-on-surface-variant);
      --md-menu-item-trailing-icon-color: var(--md-sys-color-outline);
      min-width: 272px;
    }

    #user-menu md-menu-item {
      margin-inline: 8px;
      border-radius: 16px;
      overflow: hidden;
    }

    #user-menu md-icon.external {
      font-size: 18px;
    }

    #user-menu .sign-out {
      --md-menu-item-label-text-color: var(--md-sys-color-error);
      --md-menu-item-leading-icon-color: var(--md-sys-color-error);
      --md-menu-item-hover-state-layer-color: var(--md-sys-color-error);
      --md-menu-item-pressed-state-layer-color: var(--md-sys-color-error);
    }

    #user-menu md-divider {
      margin: 8px 16px;
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 8px 8px;
      padding: 12px;
      border-radius: 16px;
      background-color: var(--md-sys-color-surface-container);
    }

    .user-menu-avatar {
      flex-shrink: 0;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-card-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
      gap: 2px;
    }

    .user-name {
      overflow: hidden;
      font-size: 16px;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--md-sys-color-on-surface);
    }

    .user-plan {
      font-size: 13px;
      color: var(--md-sys-color-on-surface-variant);
    }

    .user-plan.max {
      font-weight: 600;
      color: var(--md-sys-color-primary);
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
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'top-app-bar': TopAppBar;
  }
}
