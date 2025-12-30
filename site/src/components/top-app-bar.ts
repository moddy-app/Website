/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '@material/web/focus/md-focus-ring.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/button/filled-tonal-button.js';

import type {MdIconButton} from '@material/web/iconbutton/icon-button.js';
import {css, html, LitElement} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';
import {live} from 'lit/directives/live.js';

import {drawerOpenSignal} from '../signals/drawer-open-state.js';
import {inertContentSignal, inertSidebarSignal} from '../signals/inert.js';
import {SignalElement} from '../signals/signal-element.js';
import {moddyLogo} from '../svg/moddy-logo.js';

/**
 * Top app bar of the catalog.
 */
@customElement('top-app-bar')
export class TopAppBar extends SignalElement(LitElement) {

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
            <md-filled-tonal-button
              @click=${this.onSignInClick}>
              Sign In
            </md-filled-tonal-button>
          </section>
        </div>
        <slot></slot>
      </header>
    `;
  }

  /**
   * Redirects to the sign in page with the current URL as a parameter.
   */
  private onSignInClick() {
    const currentUrl = encodeURIComponent(window.location.href);
    window.location.href = `https://moddy.app/sign-in?url=${currentUrl}`;
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
