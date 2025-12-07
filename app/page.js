'use client';

import { useState, useEffect } from 'react';
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/ripple/ripple.js';

export default function Home() {
  const [isEnglish, setIsEnglish] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(initialDark);
    document.documentElement.setAttribute('data-theme', initialDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    const themeValue = newTheme ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeValue);
    localStorage.setItem('theme', themeValue);
  };

  const content = {
    en: {
      title: 'Coming Soon',
      subtitle: 'Moddy is currently under development',
      description: 'We\'re working hard to bring you something amazing. Stay tuned for updates!',
      supportBtn: 'Support Server',
      githubBtn: 'GitHub',
      languageBtn: 'Français',
      footer: '© 2025 Moddy. All rights reserved. Developed by'
    },
    fr: {
      title: 'Bientôt Disponible',
      subtitle: 'Moddy est actuellement en développement',
      description: 'Nous travaillons d\'arrache-pied pour vous apporter quelque chose d\'extraordinaire. Restez à l\'écoute pour les mises à jour !',
      supportBtn: 'Serveur Support',
      githubBtn: 'GitHub',
      languageBtn: 'English',
      footer: '© 2025 Moddy. Tous droits réservés. Développé par'
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

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            {/* Status Badge */}
            <div className="status-badge">
              <div className="status-indicator"></div>
              <span className="status-text md-typescale-label-medium">
                {isEnglish ? 'In Development' : 'En Développement'}
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="hero-title md-typescale-display-large">
              {t.title}
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle md-typescale-headline-small">
              {t.subtitle}
            </p>

            {/* Description */}
            <p className="hero-description md-typescale-body-large">
              {t.description}
            </p>

            {/* Action Buttons */}
            <div className="action-buttons">
              <md-filled-button
                href="https://moddy.app/support"
                target="_blank"
                className="primary-action"
              >
                <svg slot="icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                {t.supportBtn}
              </md-filled-button>

              <md-outlined-button
                href="https://moddy.app/git"
                target="_blank"
                className="secondary-action"
              >
                <svg slot="icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                {t.githubBtn}
              </md-outlined-button>
            </div>

            {/* Features Grid */}
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <span className="material-symbols-outlined">construction</span>
                </div>
                <h3 className="feature-title md-typescale-title-medium">
                  {isEnglish ? 'In Progress' : 'En Cours'}
                </h3>
                <p className="feature-description md-typescale-body-medium">
                  {isEnglish
                    ? 'Actively building new features'
                    : 'Construction active de nouvelles fonctionnalités'}
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <span className="material-symbols-outlined">palette</span>
                </div>
                <h3 className="feature-title md-typescale-title-medium">
                  {isEnglish ? 'Modern Design' : 'Design Moderne'}
                </h3>
                <p className="feature-description md-typescale-body-medium">
                  {isEnglish
                    ? 'Built with Material Design 3'
                    : 'Construit avec Material Design 3'}
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <span className="material-symbols-outlined">speed</span>
                </div>
                <h3 className="feature-title md-typescale-title-medium">
                  {isEnglish ? 'Fast & Reliable' : 'Rapide & Fiable'}
                </h3>
                <p className="feature-description md-typescale-body-medium">
                  {isEnglish
                    ? 'Optimized for performance'
                    : 'Optimisé pour la performance'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p className="footer-text md-typescale-body-small">
            {t.footer}{' '}
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
