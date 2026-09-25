/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '@material/web/focus/md-focus-ring.js';
import '@material/web/icon/icon.js';
import './copy-code-button.js';
import './hct-slider.js';

import {css, html, LitElement} from 'lit';
import {customElement, property, query, queryAll, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {live} from 'lit/directives/live.js';

import {ChangeColorEvent, ChangeDarkModeEvent} from '../types/color-events.js';
import {hctFromHex, hexFromHct} from '../utils/material-color-helpers.js';
import type {ColorMode} from '../utils/theme.js';
import {
  changeColor,
  getCurrentMode,
  getCurrentSeedColor,
  getCurrentThemeString,
} from '../utils/theme.js';

import type {HCTSlider} from './hct-slider.js';

/**
 * The theme menu of the footer: the site's colors (or a random one on every
 * visit), a custom color (color picker + HCT sliders), and the color mode.
 * The page passes the translated strings as a JSON `labels` attribute (see
 * site/_data/i18n) and the site's colors as `seeds` (site/_data/palettes.js);
 * English and the Moddy blue are the fallbacks.
 */
export interface ThemeChangerLabels {
  title: string;
  copy: string;
  copyTitle: string;
  copied: string;
  colors: string;
  random: string;
  randomTitle: string;
  custom: string;
  source: string;
  hue: string;
  chroma: string;
  tone: string;
  mode: string;
  dark: string;
  auto: string;
  autoShort: string;
  light: string;
}

const DEFAULT_LABELS: ThemeChangerLabels = {
  title: 'Theme',
  copy: 'Copy current theme',
  copyTitle: 'Copy current theme to clipboard',
  copied: 'Copied',
  colors: 'Colors',
  random: 'Random',
  randomTitle: 'A new color on every visit',
  custom: 'Custom color',
  source: 'Source color',
  hue: 'Hue',
  chroma: 'Chroma',
  tone: 'Tone',
  mode: 'Color mode',
  dark: 'Dark',
  auto: 'Automatic',
  autoShort: 'Auto',
  light: 'Light',
};

/** Set by src/pages/global.ts when a color is picked by hand; while it is
 *  absent, partials/random-theme.html picks a new color on every load. */
const LOCK_KEY = 'moddy-color-locked';

function isLocked() {
  try {
    return Boolean(localStorage.getItem(LOCK_KEY));
  } catch {
    return false;
  }
}

@customElement('theme-changer')
export class ThemeChanger extends LitElement {
  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /** The currently selected color mode. */
  @state() selectedColorMode: ColorMode | null = null;

  /**
   * The currently selected hex color.
   *
   * NOTE: Hex colors are in the srgb color space and HCT has a much larger, so
   * this value is a clipped value of HCT.
   */
  @state() hexColor = '';

  /** The current values of the hue, chroma and tone sliders. */
  @state() hue = 0;
  @state() chroma = 0;
  @state() tone = 0;

  /** Whether the color was picked by hand (else: random on every visit). */
  @state() private locked = true;

  @property({type: Object}) labels: Partial<ThemeChangerLabels> = {};

  /** The site's colors, comma-separated hex values. */
  @property() seeds = '#003BCC';

  private get text(): ThemeChangerLabels {
    return {...DEFAULT_LABELS, ...this.labels};
  }

  private get seedList() {
    return this.seeds
      .split(',')
      .map((seed) => seed.trim())
      .filter((seed) => /^#[0-9a-f]{6}$/i.test(seed));
  }

  @query('input') private inputEl!: HTMLInputElement;
  @queryAll('hct-slider') private sliders!: NodeListOf<HCTSlider>;

  render() {
    return html`
      <header>
        <h2>${this.text.title}</h2>
        <copy-code-button
          button-title=${this.text.copyTitle}
          label=${this.text.copy}
          success-label=${this.text.copied}
          .getCopyText=${getCurrentThemeString}>
        </copy-code-button>
      </header>
      ${this.renderSwatches()} ${this.renderCustom()}
      ${this.renderColorModePicker()}
    `;
  }

  /**
   * The site's colors as round swatches, after a "random" one.
   */
  private renderSwatches() {
    const current = this.hexColor.toLowerCase();
    const swatch = (seed: string) => {
      const selected = this.locked && seed.toLowerCase() === current;
      return html`<button
        class=${classMap({swatch: true, selected})}
        role="radio"
        aria-checked=${selected ? 'true' : 'false'}
        aria-label=${seed}
        title=${seed}
        style="--swatch: ${seed}"
        @click=${() => this.pickSeed(seed)}>
        <md-icon aria-hidden="true">check</md-icon>
      </button>`;
    };
    return html`<section>
      <h3 id="colors-label">${this.text.colors}</h3>
      <div class="swatches" role="radiogroup" aria-labelledby="colors-label">
        <button
          class=${classMap({swatch: true, random: true, selected: !this.locked})}
          role="radio"
          aria-checked=${this.locked ? 'false' : 'true'}
          aria-label=${`${this.text.random}: ${this.text.randomTitle}`}
          title=${this.text.randomTitle}
          @click=${this.pickRandom}>
          <md-icon aria-hidden="true">shuffle</md-icon>
        </button>
        ${this.seedList.map(swatch)}
      </div>
    </section>`;
  }

  /**
   * A custom color: the native color picker behind a round swatch, its hex
   * value, and the three HCT sliders.
   */
  private renderCustom() {
    return html`<section class="panel">
      <label id="hex" for="color-input">
        <span class="input-wrapper">
          <span class="overflow">
            <input
              id="color-input"
              aria-label=${this.text.source}
              @input=${this.onHexPickerInput}
              type="color"
              .value=${live(this.hexColor)} />
          </span>
          <md-focus-ring for="color-input"></md-focus-ring>
        </span>
        <span class="hex-text">
          <span class="label">${this.text.custom}</span>
          <code>${this.hexColor.toUpperCase()}</code>
        </span>
        <md-icon aria-hidden="true">colorize</md-icon>
      </label>
      <div class="sliders">
        <hct-slider
          .value=${live(this.hue)}
          type="hue"
          label=${this.text.hue}
          max="360"
          @input=${this.onSliderInput}></hct-slider>
        <hct-slider
          .value=${live(this.chroma)}
          .color=${this.hexColor}
          type="chroma"
          label=${this.text.chroma}
          max="150"
          @input=${this.onSliderInput}></hct-slider>
        <hct-slider
          .value=${live(this.tone)}
          type="tone"
          label=${this.text.tone}
          max="100"
          @input=${this.onSliderInput}></hct-slider>
      </div>
    </section>`;
  }

  /**
   * The color mode as three segments (a radio group): dark, auto, light.
   */
  private renderColorModePicker() {
    const modes: Array<[ColorMode, string, string]> = [
      ['dark', 'dark_mode', this.text.dark],
      ['auto', 'brightness_medium', this.text.autoShort],
      ['light', 'light_mode', this.text.light],
    ];
    return html`<div class="modes" role="radiogroup" aria-label=${this.text.mode}>
      ${modes.map(([mode, icon, label]) => {
        const selected = this.selectedColorMode === mode;
        return html`<button
          class=${classMap({selected})}
          role="radio"
          aria-checked=${selected ? 'true' : 'false'}
          title=${this.text[mode]}
          @click=${() => this.pickMode(mode)}>
          <md-icon aria-hidden="true">${icon}</md-icon>
          <span>${label}</span>
        </button>`;
      })}
    </div>`;
  }

  /** A color picked by hand: applied and kept (global.ts locks it). */
  private pickColor(hex: string) {
    this.hexColor = hex;
    this.locked = true;
    this.dispatchEvent(new ChangeColorEvent(hex));
  }

  private pickSeed(seed: string) {
    this.updateHctFromHex(seed);
    this.pickColor(seed);
  }

  /**
   * Back to a random color on every visit: unlock, and show one right away
   * (never the current one).
   */
  private pickRandom() {
    const current = this.hexColor.toLowerCase();
    const pool = this.seedList.filter((seed) => seed.toLowerCase() !== current);
    const seed = pool[Math.floor(Math.random() * pool.length)] ?? this.seedList[0];
    try {
      localStorage.removeItem(LOCK_KEY);
    } catch {
      // No storage: the color still changes for this page.
    }
    this.locked = false;
    changeColor(seed);
    this.hexColor = seed;
    this.updateHctFromHex(seed);
  }

  private onSliderInput() {
    for (const slider of this.sliders) {
      this[slider.type] = slider.value;
    }

    this.pickColor(hexFromHct(this.hue, this.chroma, this.tone));
  }

  /**
   * Updates the HCT sliders by converting a hex color to HCT.
   *
   * @param hexColor The hex color to convert to HCT and update the sliders.
   */
  private updateHctFromHex(hexColor: string) {
    const hct = hctFromHex(hexColor);
    this.hue = hct.hue;
    this.chroma = hct.chroma;
    this.tone = hct.tone;
  }

  private onHexPickerInput() {
    this.updateHctFromHex(this.inputEl.value);
    this.pickColor(this.inputEl.value);
  }

  async firstUpdated() {
    if (!this.selectedColorMode) {
      // localStorage is not available on server so must do this here.
      this.selectedColorMode = getCurrentMode();
    }

    if (!this.hexColor) {
      // localStorage is not available on server so must do this here.
      this.hexColor = getCurrentSeedColor()!;
    }

    this.locked = isLocked();
    this.updateHctFromHex(this.hexColor);
  }

  private pickMode(mode: ColorMode) {
    if (this.selectedColorMode === mode) return;
    this.selectedColorMode = mode;
    this.dispatchEvent(new ChangeDarkModeEvent(mode));
  }

  static styles = css`
    :host {
      --_copy-button-button-size: 40px;
      --_copy-button-icon-size: 22px;
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 20px;
      box-sizing: border-box;
      width: 320px;
      max-width: calc(100vw - 32px);
      padding: 8px 20px 20px;
      color: var(--md-sys-color-on-surface);
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 40px;
    }

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    h3 {
      margin: 0 0 12px;
      font-size: 13px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface-variant);
    }

    copy-code-button {
      --md-icon-button-icon-size: var(--_copy-button-icon-size);
      --md-icon-button-state-layer-width: var(--_copy-button-button-size);
      --md-icon-button-state-layer-height: var(--_copy-button-button-size);
      --catalog-copy-code-button-inset: 0;
      position: relative;
      width: var(--_copy-button-button-size);
      height: var(--_copy-button-button-size);
      margin-inline-end: -8px;
    }

    /* ---- Swatches --------------------------------------------------------- */

    .swatches {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 10px;
    }

    .swatch {
      position: relative;
      display: grid;
      place-items: center;
      aspect-ratio: 1;
      width: 100%;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background-color: var(--swatch);
      color: #fff;
      cursor: pointer;
      outline: none;
      transition: border-radius 200ms cubic-bezier(0.2, 0, 0, 1);
    }

    /* The picked color turns into a rounded square, with a check. */
    .swatch.selected {
      border-radius: 30%;
    }

    .swatch md-icon {
      --md-icon-size: 20px;
      opacity: 0;
      font-variation-settings: 'FILL' 1, 'wght' 600;
      transition: opacity 150ms;
    }

    .swatch.selected md-icon {
      opacity: 1;
    }

    .swatch:focus-visible {
      box-shadow:
        0 0 0 2px var(--md-sys-color-surface-container-lowest),
        0 0 0 4px var(--md-sys-color-secondary);
    }

    .swatch.random {
      background-color: var(--md-sys-color-surface-container-high);
      color: var(--md-sys-color-on-surface-variant);
    }

    .swatch.random md-icon {
      opacity: 1;
    }

    .swatch.random.selected {
      background-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
    }

    @media (hover: hover) {
      .swatch:not(.selected):hover {
        border-radius: 38%;
      }
    }

    /* ---- Custom color ----------------------------------------------------- */

    .panel {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px 12px 16px;
      border-radius: 20px;
      background-color: var(--md-sys-color-surface-container);
      color: var(--md-sys-color-on-surface-variant);
      --md-slider-inactive-track-color: var(--md-sys-color-outline-variant);
    }

    #hex {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px;
      border-radius: 14px;
      cursor: pointer;
    }

    #hex > md-icon {
      --md-icon-size: 20px;
      margin-inline-end: 4px;
      color: var(--md-sys-color-on-surface-variant);
    }

    .hex-text {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      gap: 2px;
      min-width: 0;
    }

    .hex-text .label {
      font-size: 14px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
    }

    .hex-text code {
      font-family: 'Google Sans Mono', monospace;
      font-size: 13px;
    }

    .input-wrapper {
      position: relative;
      flex-shrink: 0;
      box-sizing: border-box;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      box-shadow: inset 0 0 0 1px var(--md-sys-color-outline-variant);
    }

    .input-wrapper md-focus-ring {
      border-radius: 50%;
    }

    .overflow {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: inherit;
    }

    input {
      min-width: 200%;
      min-height: 200%;
      border: none;
      background: none;
      cursor: pointer;
    }

    .sliders {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding-top: 8px;
    }

    /* ---- Color mode ------------------------------------------------------- */

    .modes {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 4px;
      padding: 4px;
      border-radius: 999px;
      background-color: var(--md-sys-color-surface-container);
    }

    .modes button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      min-width: 0;
      height: 40px;
      padding: 0 4px;
      border: 0;
      border-radius: 999px;
      background: none;
      color: var(--md-sys-color-on-surface-variant);
      font: inherit;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      outline: none;
      transition:
        background-color 200ms cubic-bezier(0.2, 0, 0, 1),
        color 200ms cubic-bezier(0.2, 0, 0, 1);
    }

    .modes button md-icon {
      --md-icon-size: 18px;
      flex-shrink: 0;
    }

    .modes button span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .modes button.selected {
      background-color: var(--md-sys-color-surface-container-lowest);
      color: var(--md-sys-color-on-surface);
      box-shadow: 0 1px 2px color-mix(in srgb, var(--md-sys-color-shadow) 18%, transparent);
    }

    .modes button.selected md-icon {
      font-variation-settings: 'FILL' 1;
      color: var(--md-sys-color-primary);
    }

    .modes button:focus-visible {
      box-shadow: 0 0 0 2px var(--md-sys-color-secondary);
    }

    @media (hover: hover) {
      .modes button:not(.selected):hover {
        color: var(--md-sys-color-on-surface);
      }
    }

    @media (forced-colors: active) {
      .panel,
      .swatch {
        box-sizing: border-box;
        border: 1px solid CanvasText;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'theme-changer': ThemeChanger;
  }
}
