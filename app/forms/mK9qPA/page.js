'use client';

import { useState, useEffect } from 'react';

export default function FormPage() {
  const [isEnglish, setIsEnglish] = useState(true);
  const discordOAuthURL = "https://discord.com/oauth2/authorize?client_id=1373916203814490194&response_type=code&redirect_uri=https%3A%2F%2Fmoddy.app%2Fforms%2FmK9qPA%2Fcallback&scope=identify+email+guilds";

  useEffect(() => {
    // Vérifie si on a une erreur dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
      console.error('Erreur OAuth:', error);
    }
  }, []);

  return (
    <>
      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: var(--font-sora, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          color: #202020;
          position: relative;
        }

        /* Header Bar */
        .header-bar {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 72px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
          z-index: 100;
        }

        .logo-container { height: 40px; width: auto; cursor: pointer; transition: transform 0.2s ease; }
        .logo-container:hover { transform: scale(1.05); }
        .logo-container img { height: 100%; width: auto; object-fit: contain; }

        .language-toggle {
          background: #f7f7f7;
          border: 1px solid rgba(0, 0, 0, 0.08);
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: var(--font-sora, sans-serif);
          color: #202020;
          border-radius: 20px;
          transition: all 0.2s ease;
          letter-spacing: 0.3px;
        }
        .language-toggle:hover { background: #202020; color: #ffffff; border-color: #202020; }

        /* Main Content */
        .main-content {
          flex: 1;
          display: flex;
          align-items: center;
          padding: 120px 48px 80px;
        }

        .container { max-width: 1200px; width: 100%; margin: 0 auto; }
        .content-wrapper { max-width: 600px; }

        h1 {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 28px;
          color: #202020;
          letter-spacing: -0.04em;
          line-height: 1.05;
          font-family: var(--font-epilogue, var(--font-sora, sans-serif));
        }

        .subtitle {
          font-size: 1.25rem;
          color: #6e6e6e;
          margin-bottom: 56px;
          font-weight: 400;
          line-height: 1.6;
          letter-spacing: -0.01em;
        }

        /* Error message */
        .error-message {
          background: #fef2f2;
          border: 1px solid #fee2e2;
          color: #991b1b;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 0.875rem;
        }

        /* Buttons Container */
        .buttons { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }

        /* Button Styles */
        .btn {
          position: relative;
          padding: 14px 28px;
          background: #202020;
          color: #ffffff;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 500;
          font-size: 0.95rem;
          display: inline-flex;
          align-items: center; justify-content: center;
          gap: 10px;
          border: 1.5px solid transparent;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          letter-spacing: -0.01em;
          overflow: hidden;
        }
        .btn::before {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s ease;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          background: #5865F2;
          border-color: #5865F2;
        }
        .btn:hover::before { left: 100%; }
        .btn:active { transform: translateY(0); transition: transform 0.1s; }
        .btn svg { width: 18px; height: 18px; fill: currentColor; }

        .btn.btn-secondary {
          background: transparent;
          color: #202020;
          border: 1.5px solid rgba(0, 0, 0, 0.12);
        }
        .btn.btn-secondary:hover {
          background: #202020; color: #ffffff; border-color: #202020;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        /* Footer */
        .footer {
          padding: 32px 48px;
          font-size: 0.8rem;
          color: #a0a0a0;
          font-weight: 300;
          letter-spacing: 0.01em;
          border-top: 1px solid rgba(0, 0, 0, 0.04);
        }
        .footer p { margin: 0; }
        .footer a { color: #6e6e6e; text-decoration: none; transition: color 0.2s ease; font-weight: 400; }
        .footer a strong { font-weight: 600; color: #202020; }
        .footer a:hover { color: #10a37f; }
        .footer a:hover strong { color: #10a37f; }

        /* Security note */
        .security-note {
          margin-top: 32px;
          font-size: 0.85rem;
          color: #a0a0a0;
          line-height: 1.5;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .main-content { padding: 120px 32px 80px; }
          .header-bar { padding: 0 32px; }
          .footer { padding: 28px 32px; }
        }
        @media (max-width: 768px) {
          .header-bar { padding: 0 24px; height: 64px; }
          .logo-container { height: 32px; }
          h1 { font-size: 2.5rem; }
          .subtitle { font-size: 1.125rem; margin-bottom: 40px; }
          .buttons { flex-direction: column; align-items: flex-start; width: 100%; max-width: 320px; }
          .btn { width: 100%; }
          .main-content { padding: 100px 24px 60px; }
          .footer { padding: 24px; font-size: 0.75rem; }
        }
        @media (max-width: 480px) {
          h1 { font-size: 2rem; margin-bottom: 20px; }
          .subtitle { font-size: 1rem; }
          .btn { font-size: 0.875rem; padding: 12px 24px; }
        }
      `}</style>

      {/* Header Bar */}
      <header className="header-bar">
        <div className="logo-container" onClick={() => (window.location.href = '/')}>
          <img src="https://moddy.app/logo.png" alt="Moddy Logo" />
        </div>
        <button className="language-toggle" onClick={() => setIsEnglish((v) => !v)}>
          EN / FR
        </button>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          <div className="content-wrapper">
            {/* Error message if present */}
            {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('error') && (
              <div className="error-message">
                {isEnglish
                  ? 'Authentication failed. Please try again.'
                  : 'Échec de l\'authentification. Veuillez réessayer.'}
              </div>
            )}

            {/* English */}
            {isEnglish && (
              <div className="content-en active">
                <h1>Form Authentication</h1>
                <p className="subtitle">
                  To access the form, please log in with your Discord account.<br />
                  This helps us verify your identity and prevent spam.
                </p>
              </div>
            )}

            {/* French */}
            {!isEnglish && (
              <div className="content-fr active">
                <h1>Authentification du formulaire</h1>
                <p className="subtitle">
                  Pour accéder au formulaire, veuillez vous connecter avec votre compte Discord.<br />
                  Cela nous aide à vérifier votre identité et à prévenir le spam.
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="buttons">
              <a href={discordOAuthURL} className="btn">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span className="btn-text">
                  {isEnglish ? 'Connect with Discord' : 'Se connecter avec Discord'}
                </span>
              </a>

              <a href="/" className="btn btn-secondary">
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="btn-text">
                  {isEnglish ? 'Back to Home' : 'Retour à l\'accueil'}
                </span>
              </a>
            </div>

            {/* Security note */}
            <p className="security-note">
              {isEnglish
                ? '🔒 Your information is secure and will only be used to validate your submission.'
                : '🔒 Vos informations sont sécurisées et ne seront utilisées que pour valider votre soumission.'}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          <span className="footer-text">
            {isEnglish
              ? '© 2025 Moddy. All rights reserved. Developed by'
              : '© 2025 Moddy. Tous droits réservés. Développé par'}
          </span>{' '}
          <a href="https://juthing.xyz" target="_blank" rel="noopener noreferrer">
            @<strong>juthing</strong>
          </a>
        </p>
      </footer>
    </>
  );
}