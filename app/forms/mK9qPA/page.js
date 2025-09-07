'use client';

import { useEffect } from 'react';

export default function FormPage() {
  const discordOAuthURL = "https://discord.com/oauth2/authorize?client_id=1373916203814490194&response_type=code&redirect_uri=https%3A%2F%2Fmoddy.app%2Fforms%2FmK9qPA%2Fcallback&scope=identify+email+guilds";

  useEffect(() => {
    // Vérifie si on a une erreur dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error')) {
      console.error('Erreur OAuth:', urlParams.get('error'));
    }
  }, []);

  return (
    <>
      <style jsx>{`
        .form-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .form-card {
          background: white;
          border-radius: 20px;
          padding: 48px;
          max-width: 480px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
        }

        .form-logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          color: white;
        }

        .form-title {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        .form-subtitle {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        .discord-button {
          background: #5865F2;
          color: white;
          border: none;
          padding: 14px 32px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .discord-button:hover {
          background: #4752C4;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(88, 101, 242, 0.3);
        }

        .discord-icon {
          width: 24px;
          height: 24px;
        }

        .security-note {
          margin-top: 32px;
          padding: 16px;
          background: #f3f4f6;
          border-radius: 12px;
          font-size: 13px;
          color: #6b7280;
          line-height: 1.5;
        }

        .lock-icon {
          display: inline-block;
          width: 16px;
          height: 16px;
          margin-right: 6px;
          vertical-align: middle;
        }

        @media (max-width: 640px) {
          .form-card {
            padding: 32px 24px;
          }
          .form-title {
            font-size: 24px;
          }
        }
      `}</style>

      <div className="form-container">
        <div className="form-card">
          <div className="form-logo">📝</div>

          <h1 className="form-title">Formulaire Moddy</h1>

          <p className="form-subtitle">
            Pour accéder au formulaire, connectez-vous avec votre compte Discord.
            Cela nous permet de vérifier votre identité et d'éviter le spam.
          </p>

          <a href={discordOAuthURL} className="discord-button">
            <svg className="discord-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Se connecter avec Discord
          </a>

          <div className="security-note">
            <svg className="lock-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
            Vos informations sont sécurisées et ne seront utilisées que pour valider votre soumission.
          </div>
        </div>
      </div>
    </>
  );
}