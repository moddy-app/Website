'use client';

import { useState, useEffect } from 'react';
import './form-styles.css';

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
          <div className="form-card">
            {/* Badges */}
            <div className="badges-container">
              <span className="badge badge-official">
                {isEnglish ? 'Official' : 'Officiel'}
              </span>
              <span className="badge badge-status-open">
                {isEnglish ? 'Open' : 'Ouvert'}
              </span>
            </div>

            {/* Form Title */}
            <h2 className="form-title">Moddy | Dev Application</h2>

            {/* Error message if present */}
            {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('error') && (
              <div className="error-message">
                {isEnglish
                  ? 'Authentication failed. Please try again.'
                  : 'Échec de l\'authentification. Veuillez réessayer.'}
              </div>
            )}

            {/* Content */}
            <h1>{isEnglish ? 'Authentication Required' : 'Authentification requise'}</h1>
            <p className="subtitle">
              {isEnglish
                ? 'To submit your developer application, please log in with your Discord account. This helps us verify your identity and contact you about your application.'
                : 'Pour soumettre votre candidature de développeur, veuillez vous connecter avec votre compte Discord. Cela nous aide à vérifier votre identité et à vous contacter concernant votre candidature.'}
            </p>

            {/* Buttons */}
            <div className="buttons">
              <a href={discordOAuthURL} className="btn btn-primary">
                <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span>{isEnglish ? 'Connect with Discord' : 'Se connecter avec Discord'}</span>
              </a>

              <a href="/" className="btn btn-secondary">
                <span>← {isEnglish ? 'Back to Home' : 'Retour à l\'accueil'}</span>
              </a>
            </div>

            {/* Security note */}
            <p className="security-note">
              🔒 {isEnglish
                ? 'Your information is secure and will only be used to process your application.'
                : 'Vos informations sont sécurisées et ne seront utilisées que pour traiter votre candidature.'}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          <span>
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