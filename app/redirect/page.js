'use client';

import { useState, useEffect } from 'react';
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/linear-progress.js';
import './redirect-styles.css';

export default function RedirectPage() {
  const [isEnglish, setIsEnglish] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(initialDark);
    document.documentElement.setAttribute('data-theme', initialDark ? 'dark' : 'light');
  }, []);

  // Get redirect URL from query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get('url');
    if (url) {
      setRedirectUrl(decodeURIComponent(url));
    }
  }, []);

  // Redirect after 3 seconds
  useEffect(() => {
    if (!redirectUrl) return;

    const timer = setTimeout(() => {
      window.location.href = redirectUrl;
    }, 3000);

    return () => clearTimeout(timer);
  }, [redirectUrl]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    const themeValue = newTheme ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeValue);
    localStorage.setItem('theme', themeValue);
  };

  const content = {
    en: {
      title: 'Redirecting...',
      message: 'You will be redirected shortly',
      noUrl: 'No redirect URL provided',
      goHome: 'Go to Home',
      languageBtn: 'Français'
    },
    fr: {
      title: 'Redirection...',
      message: 'Vous allez être redirigé',
      noUrl: 'Aucune URL de redirection fournie',
      goHome: "Aller à l'accueil",
      languageBtn: 'English'
    }
  };

  const t = isEnglish ? content.en : content.fr;

  return (
    <>
      {/* Top App Bar */}
      <header className="top-app-bar">
        <div className="top-app-bar-container">
          <div className="logo-wrapper" onClick={() => (window.location.href = '/')}>
            <img
              src={isDarkMode ? "https://www.moddy.app/logowhite.png" : "https://moddy.app/logo.png"}
              alt="Moddy Logo"
              className="logo"
            />
          </div>

          <div className="header-actions">
            <md-icon-button onClick={toggleTheme} className="theme-toggle">
              <span className="material-symbols-outlined">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </md-icon-button>

            <md-filled-tonal-button
              className="language-btn"
              onClick={() => setIsEnglish(!isEnglish)}
            >
              <span className="material-symbols-outlined" slot="icon">
                language
              </span>
              {t.languageBtn}
            </md-filled-tonal-button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="redirect-section">
        <div className="redirect-container">
          {redirectUrl ? (
            <div className="redirect-card">
              <md-linear-progress indeterminate></md-linear-progress>

              <div className="redirect-content">
                <span className="material-symbols-outlined redirect-icon">
                  open_in_new
                </span>

                <h1 className="redirect-title md-typescale-headline-medium">
                  {t.title}
                </h1>

                <p className="redirect-message md-typescale-body-large">
                  {t.message}
                </p>

                <div className="redirect-url">
                  <span className="material-symbols-outlined">link</span>
                  <span className="redirect-url-text">{redirectUrl}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="redirect-card">
              <div className="redirect-content">
                <span className="material-symbols-outlined redirect-icon error">
                  error
                </span>

                <h1 className="redirect-title md-typescale-headline-medium">
                  {t.noUrl}
                </h1>

                <md-filled-button href="/" className="redirect-home-btn">
                  <span className="material-symbols-outlined" slot="icon">home</span>
                  {t.goHome}
                </md-filled-button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p className="footer-text md-typescale-body-small">
            {isEnglish
              ? '© 2025 Moddy. All rights reserved. Developed by'
              : '© 2025 Moddy. Tous droits réservés. Développé par'}{' '}
            <a
              href="https://juthing.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              @juthing
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
