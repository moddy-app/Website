import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Configuration Discord
const DISCORD_CLIENT_ID = '1373916203814490194';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = 'https://moddy.app/forms/mK9qPA/callback';

// Clé secrète pour HMAC
const HMAC_SECRET = process.env.FORM_OAUTH2_PRIVATE_KEY;

// Webhook pour logger les infos brutes
const WEBHOOK_URL = process.env.WEBHOOK_OAUTH2;

// Fonction pour envoyer les données au webhook
async function sendToWebhook(data) {
  if (!WEBHOOK_URL) return;

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: null,
        embeds: [{
          title: "🔐 Nouvelle authentification Discord",
          color: 0x5865F2,
          fields: [
            { name: "Discord ID", value: data.discord_id || "N/A", inline: true },
            { name: "Username", value: data.username || "N/A", inline: true },
            { name: "Email", value: data.email || "N/A", inline: true },
            { name: "Timestamp", value: new Date(data.timestamp * 1000).toISOString(), inline: false },
            { name: "Signature", value: `\`${data.signature?.substring(0, 20)}...\``, inline: false }
          ],
          timestamp: new Date().toISOString()
        }]
      })
    });
  } catch (error) {
    console.error('Erreur webhook:', error);
  }
}

// Fonction pour générer la signature HMAC
function generateSignature(discordId, timestamp) {
  if (!HMAC_SECRET) {
    throw new Error('FORM_OAUTH2_PRIVATE_KEY non configurée');
  }

  const data = `${discordId}.${timestamp}`;
  return crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(data)
    .digest('hex');
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Si erreur OAuth
  if (error) {
    return NextResponse.redirect(new URL('/forms/mK9qPA?error=' + error, request.url));
  }

  // Si pas de code
  if (!code) {
    return NextResponse.redirect(new URL('/forms/mK9qPA?error=no_code', request.url));
  }

  try {
    // Vérifier les variables d'environnement
    if (!DISCORD_CLIENT_SECRET) {
      throw new Error('DISCORD_CLIENT_SECRET non configurée');
    }

    // Échanger le code contre un token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Erreur token Discord:', errorData);
      throw new Error('Échec de l\'échange du token');
    }

    const tokenData = await tokenResponse.json();

    // Récupérer les infos utilisateur
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Échec de la récupération des infos utilisateur');
    }

    const userData = await userResponse.json();

    // Générer le timestamp actuel
    const timestamp = Math.floor(Date.now() / 1000);

    // Générer la signature HMAC
    const signature = generateSignature(userData.id, timestamp);

    // Préparer les données pour le webhook
    const webhookData = {
      discord_id: userData.id,
      username: `${userData.username}#${userData.discriminator}`,
      email: userData.email,
      timestamp: timestamp,
      signature: signature,
      avatar: userData.avatar,
      locale: userData.locale,
      verified: userData.verified,
      raw_data: userData
    };

    // Envoyer au webhook
    await sendToWebhook(webhookData);

    // Construire l'URL Tally avec les paramètres
    const tallyURL = new URL('https://tally.so/r/mK9qPA');
    tallyURL.searchParams.append('discord_id', userData.id);
    tallyURL.searchParams.append('ts', timestamp.toString());
    tallyURL.searchParams.append('sig', signature);
    tallyURL.searchParams.append('mail', userData.email || '');

    // Rediriger vers Tally
    return NextResponse.redirect(tallyURL.toString());

  } catch (error) {
    console.error('Erreur callback Discord:', error);

    // Envoyer l'erreur au webhook aussi
    if (WEBHOOK_URL) {
      try {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: null,
            embeds: [{
              title: "❌ Erreur d'authentification",
              color: 0xFF0000,
              description: error.message,
              timestamp: new Date().toISOString()
            }]
          })
        });
      } catch (webhookError) {
        console.error('Erreur envoi webhook erreur:', webhookError);
      }
    }

    return NextResponse.redirect(new URL('/forms/mK9qPA?error=auth_failed', request.url));
  }
}