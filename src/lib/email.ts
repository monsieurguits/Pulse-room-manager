interface WelcomeModelEmailInput {
  modelName: string;
  modelEmail: string;
  temporaryPassword: string;
  adminEmail: string;
}

const DEFAULT_APP_URL = 'https://pulse-room-manager.vercel.app';

function getAppUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_DOMAIN ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    DEFAULT_APP_URL;

  return raw.replace(/\/$/, '');
}

export async function sendModelWelcomeEmail(input: WelcomeModelEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const appUrl = getAppUrl();

  if (!apiKey || !from) {
    throw new Error('Configuration email manquante : RESEND_API_KEY et EMAIL_FROM sont requis.');
  }

  const supportEmail = process.env.SUPPORT_EMAIL || input.adminEmail;
  const logoUrl = `${appUrl}/pulseroom-logo-transparent.png`;
  const subject = 'Bienvenue sur PULSEROOM – Vos accès et guide de démarrage';

  const text = [
    'Bonjour,',
    '',
    'Bienvenue sur PULSEROOM ! Nous sommes ravis de vous compter parmi nos utilisateurs.',
    '',
    'Votre espace personnel est désormais créé et prêt à être utilisé.',
    '',
    'Vos identifiants de connexion',
    '',
    `Adresse de connexion : ${appUrl}`,
    '',
    `Identifiant : ${input.modelEmail}`,
    '',
    `Mot de passe : ${input.temporaryPassword}`,
    '',
    'Important : Pour des raisons de sécurité, nous vous recommandons de modifier votre mot de passe dès votre première connexion.',
    '',
    'Documents de configuration',
    '',
    'Afin de configurer correctement votre compte, rendez-vous dans votre espace Compte puis dans la rubrique Documentation.',
    '',
    'Vous y trouverez notamment :',
    '- Le guide de prise en main de PULSEROOM.',
    '- La procédure de connexion de votre compte Lovense.',
    '- Les étapes pour connecter vos appareils.',
    '- Les recommandations de sécurité.',
    '- Les Conditions Générales d’Utilisation (CGU).',
    '- La Politique de confidentialité.',
    '',
    'Nous vous conseillons de consulter ces documents avant de commencer à utiliser la plateforme.',
    '',
    'Besoin d’aide ?',
    '',
    'Si vous rencontrez la moindre difficulté lors de la configuration ou de l’utilisation de PULSEROOM, notre équipe reste à votre disposition.',
    '',
    'Il vous suffit de répondre directement à cet e-mail ou de nous contacter via le support.',
    '',
    'Nous vous remercions de votre confiance et vous souhaitons une excellente utilisation de PULSEROOM.',
    '',
    'Cordialement,',
    '',
    'L’équipe PULSEROOM',
    'La solution professionnelle de gestion des accès et du contrôle Lovense.',
  ].join('\n');

  const html = `
    <div style="margin:0;background:#050509;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#f8fafc;">
      <div style="max-width:680px;margin:0 auto;border:1px solid rgba(255,255,255,.14);border-radius:24px;background:rgba(10,10,18,.92);overflow:hidden;">
        <div style="padding:32px 28px;text-align:center;background:linear-gradient(135deg,rgba(255,46,109,.24),rgba(0,216,255,.18));">
          <img src="${logoUrl}" alt="PULSEROOM" style="width:150px;height:auto;margin:0 auto 18px;display:block;" />
          <h1 style="margin:0;font-size:28px;line-height:1.15;color:#ffffff;">Bienvenue sur PULSEROOM</h1>
          <p style="margin:10px 0 0;color:#cbd5e1;font-size:14px;">Votre espace personnel est désormais créé et prêt à être utilisé.</p>
        </div>

        <div style="padding:28px;">
          <p style="margin:0 0 18px;color:#e5e7eb;">Bonjour ${escapeHtml(input.modelName)},</p>
          <p style="margin:0 0 22px;color:#cbd5e1;line-height:1.65;">Bienvenue sur PULSEROOM ! Nous sommes ravis de vous compter parmi nos utilisateurs.</p>

          <div style="border:1px solid rgba(0,216,255,.24);border-radius:18px;background:rgba(0,216,255,.07);padding:18px;margin:24px 0;">
            <h2 style="margin:0 0 14px;color:#ffffff;font-size:18px;">Vos identifiants de connexion</h2>
            <p style="margin:0 0 10px;color:#94a3b8;font-size:13px;">Adresse de connexion</p>
            <p style="margin:0 0 16px;"><a href="${appUrl}" style="color:#00d8ff;text-decoration:none;font-weight:bold;">${appUrl}</a></p>
            <p style="margin:0 0 10px;color:#94a3b8;font-size:13px;">Identifiant</p>
            <p style="margin:0 0 16px;color:#ffffff;font-weight:bold;">${escapeHtml(input.modelEmail)}</p>
            <p style="margin:0 0 10px;color:#94a3b8;font-size:13px;">Mot de passe temporaire</p>
            <p style="margin:0;color:#ffffff;font-weight:bold;font-size:18px;">${escapeHtml(input.temporaryPassword)}</p>
          </div>

          <p style="margin:0 0 22px;color:#ffb4ce;line-height:1.6;"><strong>Important :</strong> Pour des raisons de sécurité, nous vous recommandons de modifier votre mot de passe dès votre première connexion.</p>

          <h2 style="margin:26px 0 12px;color:#ffffff;font-size:18px;">Documents de configuration</h2>
          <p style="margin:0 0 14px;color:#cbd5e1;line-height:1.65;">Afin de configurer correctement votre compte, rendez-vous dans votre espace Compte puis dans la rubrique Documentation.</p>
          <ul style="margin:0 0 24px;padding-left:20px;color:#cbd5e1;line-height:1.8;">
            <li>Le guide de prise en main de PULSEROOM.</li>
            <li>La procédure de connexion de votre compte Lovense.</li>
            <li>Les étapes pour connecter vos appareils.</li>
            <li>Les recommandations de sécurité.</li>
            <li>Les Conditions Générales d’Utilisation (CGU).</li>
            <li>La Politique de confidentialité.</li>
          </ul>

          <h2 style="margin:26px 0 12px;color:#ffffff;font-size:18px;">Besoin d’aide ?</h2>
          <p style="margin:0;color:#cbd5e1;line-height:1.65;">Si vous rencontrez la moindre difficulté lors de la configuration ou de l’utilisation de PULSEROOM, notre équipe reste à votre disposition.</p>
          <p style="margin:12px 0 0;color:#cbd5e1;line-height:1.65;">Il vous suffit de répondre directement à cet e-mail ou de nous contacter via le support : <a href="mailto:${supportEmail}" style="color:#00d8ff;text-decoration:none;">${supportEmail}</a>.</p>

          <p style="margin:28px 0 0;color:#e5e7eb;line-height:1.65;">Nous vous remercions de votre confiance et vous souhaitons une excellente utilisation de PULSEROOM.</p>
          <p style="margin:24px 0 0;color:#ffffff;font-weight:bold;">L’équipe PULSEROOM</p>
          <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">La solution professionnelle de gestion des accès et du contrôle Lovense.</p>
        </div>
      </div>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.modelEmail],
      bcc: [input.adminEmail],
      reply_to: supportEmail,
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => '');
    throw new Error(error || "L'email de bienvenue n'a pas pu être envoyé.");
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
