import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Clé secrète HMAC (la même que pour la génération)
const HMAC_SECRET = process.env.FORM_OAUTH2_PRIVATE_KEY;

// Durée de validité en secondes (15 minutes)
const SIGNATURE_VALIDITY = 15 * 60;

// Webhook pour les notifications (optionnel)
const NOTIFICATION_WEBHOOK = process.env.WEBHOOK_FORM_NOTIFICATIONS;

// Fonction pour recalculer la signature
function verifySignature(discordId, timestamp, receivedSignature) {
  if (!HMAC_SECRET) {
    console.error('FORM_OAUTH2_PRIVATE_KEY non configurée');
    return false;
  }

  const data = `${discordId}.${timestamp}`;
  const expectedSignature = crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(data)
    .digest('hex');

  // Comparaison sécurisée (timing-safe)
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(receivedSignature)
  );
}

// Fonction pour envoyer une notification
async function sendNotification(type, data) {
  if (!NOTIFICATION_WEBHOOK) return;

  const colors = {
    success: 0x00FF00,
    warning: 0xFFFF00,
    error: 0xFF0000
  };

  try {
    await fetch(NOTIFICATION_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: null,
        embeds: [{
          title: type === 'success' ? '✅ Formulaire validé' : '⚠️ Formulaire rejeté',
          color: colors[type],
          fields: [
            { name: 'Discord ID', value: data.discord_id || 'N/A', inline: true },
            { name: 'Email', value: data.mail || 'N/A', inline: true },
            { name: 'Raison', value: data.reason || 'N/A', inline: false },
            { name: 'Timestamp soumission', value: data.ts ? new Date(data.ts * 1000).toISOString() : 'N/A', inline: false }
          ],
          timestamp: new Date().toISOString()
        }]
      })
    });
  } catch (error) {
    console.error('Erreur envoi notification:', error);
  }
}

export async function POST(request) {
  try {
    // Parser le body de la requête
    const body = await request.json();

    // Tally envoie les données dans un format spécifique
    // On suppose que les hidden fields sont dans body.data.fields
    const fields = body.data?.fields || body.fields || body;

    // Extraire les champs nécessaires
    const discordId = fields.discord_id;
    const timestamp = parseInt(fields.ts);
    const signature = fields.sig;
    const email = fields.mail;

    // Validation des champs requis
    if (!discordId || !timestamp || !signature) {
      await sendNotification('error', {
        discord_id: discordId,
        mail: email,
        reason: 'Champs manquants'
      });

      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Vérifier la fraîcheur du timestamp
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = currentTime - timestamp;

    if (timeDiff > SIGNATURE_VALIDITY) {
      await sendNotification('warning', {
        discord_id: discordId,
        mail: email,
        ts: timestamp,
        reason: `Signature expirée (${Math.floor(timeDiff / 60)} minutes)`
      });

      return NextResponse.json({
        success: false,
        error: 'Signature expired',
        details: `Submission was ${Math.floor(timeDiff / 60)} minutes old`
      }, { status: 401 });
    }

    // Vérifier la signature
    const isValid = verifySignature(discordId, timestamp, signature);

    if (!isValid) {
      await sendNotification('error', {
        discord_id: discordId,
        mail: email,
        ts: timestamp,
        reason: 'Signature invalide'
      });

      return NextResponse.json({
        success: false,
        error: 'Invalid signature'
      }, { status: 401 });
    }

    // Tout est valide !
    await sendNotification('success', {
      discord_id: discordId,
      mail: email,
      ts: timestamp,
      reason: 'Validation réussie'
    });

    // Tu peux ajouter ici d'autres traitements
    // Par exemple: sauvegarder en base de données, envoyer un email, etc.

    return NextResponse.json({
      success: true,
      message: 'Form submission validated successfully',
      data: {
        discord_id: discordId,
        email: email,
        submitted_at: new Date(timestamp * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur validation webhook:', error);

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Optionnel: endpoint GET pour tester que le webhook est actif
export async function GET() {
  return NextResponse.json({
    status: 'active',
    message: 'Tally webhook validator is running',
    timestamp: new Date().toISOString()
  });
}