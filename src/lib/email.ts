interface WelcomeModelEmailInput {
  modelName: string;
  modelEmail: string;
  temporaryPassword: string;
  adminEmail: string;
}

const DEFAULT_APP_URL = 'https://pulse-room.app';
const PUBLIC_APP_URL = 'https://pulse-room.app';

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

  const supportEmail = 'contact@pulse-room.app';
  const loginUrl = `${PUBLIC_APP_URL}/login`;
  const logoUrl = `${PUBLIC_APP_URL}/pulseroom-logo-transparent.png`;
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
    `Adresse mail support : ${supportEmail}`,
    '',
    `Lien d'accès à votre espace : ${loginUrl}`,
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
    `Il vous suffit de répondre directement à cet e-mail ou de nous contacter via le support : ${supportEmail}.`,
    '',
    'Nous vous remercions de votre confiance et vous souhaitons une excellente utilisation de PULSEROOM.',
    '',
    'Cordialement,',
    '',
    'L’équipe PULSEROOM',
    'La solution professionnelle de gestion des accès et du contrôle Lovense.',
  ].join('\n');

  const html = `
    <div style="margin:0;padding:0;background:#06060b;font-family:Arial,Helvetica,sans-serif;color:#f8fafc;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#06060b;">
        <tr>
          <td align="center" style="padding:38px 16px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:720px;border-collapse:separate;border-spacing:0;">
              <tr>
                <td style="border-radius:28px;overflow:hidden;border:1px solid rgba(255,255,255,.14);background:#0b0b13;box-shadow:0 28px 80px rgba(0,0,0,.45);">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="padding:0;background:linear-gradient(135deg,#ff2e6d 0%,#8b5cf6 46%,#00d8ff 100%);">
                        <div style="padding:1px;">
                          <div style="padding:34px 28px 30px;text-align:center;background:linear-gradient(180deg,rgba(10,10,18,.62),rgba(10,10,18,.92));">
                            <img src="${logoUrl}" alt="PULSEROOM" style="width:168px;height:auto;margin:0 auto 18px;display:block;" />
                            <div style="display:inline-block;margin:0 0 16px;padding:7px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.09);color:#e2e8f0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;">Compte modèle activé</div>
                            <h1 style="margin:0;color:#ffffff;font-size:30px;line-height:1.15;font-weight:800;">Bienvenue sur PULSEROOM</h1>
                            <p style="margin:12px auto 0;max-width:520px;color:#dbeafe;font-size:15px;line-height:1.65;">Votre espace personnel est créé. Vous pouvez maintenant configurer votre profil, connecter Lovense et préparer vos sessions.</p>
                          </div>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:32px 30px 8px;background:#0b0b13;">
                        <p style="margin:0 0 18px;color:#f8fafc;font-size:16px;">Bonjour ${escapeHtml(input.modelName)},</p>
                        <p style="margin:0;color:#cbd5e1;font-size:15px;line-height:1.75;">Bienvenue sur PULSEROOM ! Nous sommes ravis de vous compter parmi nos utilisateurs. Voici vos accès de connexion et les premières étapes à suivre pour démarrer dans les meilleures conditions.</p>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:22px 30px 6px;background:#0b0b13;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-radius:22px;border:1px solid rgba(0,216,255,.28);background:linear-gradient(135deg,rgba(0,216,255,.11),rgba(255,46,109,.08));">
                          <tr>
                            <td style="padding:24px;">
                              <h2 style="margin:0 0 18px;color:#ffffff;font-size:19px;line-height:1.25;">Vos identifiants de connexion</h2>
                              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                  <td style="padding:0 0 14px;">
                                    <p style="margin:0 0 7px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.07em;">Adresse mail support</p>
                                    <p style="margin:0;"><a href="mailto:${supportEmail}" style="color:#67e8f9;text-decoration:none;font-size:15px;font-weight:700;">${supportEmail}</a></p>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding:0 0 14px;">
                                    <p style="margin:0 0 7px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.07em;">Lien d’accès à votre espace</p>
                                    <p style="margin:0;color:#67e8f9;font-size:15px;font-weight:700;">${loginUrl}</p>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding:0 0 14px;">
                                    <p style="margin:0 0 7px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.07em;">Identifiant</p>
                                    <p style="margin:0;color:#ffffff;font-size:16px;font-weight:700;">${escapeHtml(input.modelEmail)}</p>
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <p style="margin:0 0 7px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.07em;">Mot de passe temporaire</p>
                                    <p style="margin:0;display:inline-block;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14);color:#ffffff;font-size:18px;font-weight:800;letter-spacing:.03em;">${escapeHtml(input.temporaryPassword)}</p>
                                  </td>
                                </tr>
                              </table>

                              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:22px;">
                                <tr>
                                  <td style="border-radius:999px;background:linear-gradient(135deg,#ff2e6d,#00d8ff);">
                                    <a href="${loginUrl}" target="_blank" rel="noopener" style="display:block;padding:13px 20px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;">Ouvrir mon espace PULSEROOM</a>
                                  </td>
                                </tr>
                              </table>
                              <p style="margin:14px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">Si le bouton ne fonctionne pas, copiez-collez le lien d’accès affiché ci-dessus dans votre navigateur.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:18px 30px 6px;background:#0b0b13;">
                        <div style="border-radius:18px;border:1px solid rgba(255,46,109,.28);background:rgba(255,46,109,.08);padding:16px 18px;">
                          <p style="margin:0;color:#ffd1df;font-size:14px;line-height:1.65;"><strong>Important :</strong> pour des raisons de sécurité, nous vous recommandons de modifier votre mot de passe dès votre première connexion.</p>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:22px 30px 0;background:#0b0b13;">
                        <h2 style="margin:0 0 12px;color:#ffffff;font-size:19px;">Documents de configuration</h2>
                        <p style="margin:0 0 16px;color:#cbd5e1;font-size:15px;line-height:1.7;">Afin de configurer correctement votre compte, rendez-vous dans votre espace Compte puis dans la rubrique Documentation.</p>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="padding:0 0 10px;color:#dbeafe;font-size:14px;line-height:1.6;">• Le guide de prise en main de PULSEROOM.</td>
                          </tr>
                          <tr>
                            <td style="padding:0 0 10px;color:#dbeafe;font-size:14px;line-height:1.6;">• La procédure de connexion de votre compte Lovense.</td>
                          </tr>
                          <tr>
                            <td style="padding:0 0 10px;color:#dbeafe;font-size:14px;line-height:1.6;">• Les étapes pour connecter vos appareils.</td>
                          </tr>
                          <tr>
                            <td style="padding:0 0 10px;color:#dbeafe;font-size:14px;line-height:1.6;">• Les recommandations de sécurité.</td>
                          </tr>
                          <tr>
                            <td style="padding:0 0 10px;color:#dbeafe;font-size:14px;line-height:1.6;">• Les Conditions Générales d’Utilisation et la Politique de confidentialité.</td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:20px 30px 30px;background:#0b0b13;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-radius:20px;background:#11111c;border:1px solid rgba(255,255,255,.1);">
                          <tr>
                            <td style="padding:20px;">
                              <h2 style="margin:0 0 10px;color:#ffffff;font-size:18px;">Besoin d’aide ?</h2>
                              <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.7;">Si vous rencontrez la moindre difficulté lors de la configuration ou de l’utilisation de PULSEROOM, notre équipe reste à votre disposition.</p>
                              <p style="margin:12px 0 0;color:#cbd5e1;font-size:14px;line-height:1.7;">Répondez directement à cet e-mail ou contactez le support : <a href="mailto:${supportEmail}" style="color:#67e8f9;text-decoration:none;font-weight:700;">${supportEmail}</a>.</p>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:24px 0 0;color:#e5e7eb;font-size:15px;line-height:1.7;">Nous vous remercions de votre confiance et vous souhaitons une excellente utilisation de PULSEROOM.</p>
                        <p style="margin:22px 0 0;color:#ffffff;font-size:15px;font-weight:800;">L’équipe PULSEROOM</p>
                        <p style="margin:5px 0 0;color:#94a3b8;font-size:13px;">La solution professionnelle de gestion des accès et du contrôle Lovense.</p>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:18px 30px 28px;text-align:center;background:#080810;border-top:1px solid rgba(255,255,255,.08);">
                        <p style="margin:0;color:#64748b;font-size:12px;line-height:1.55;">Plateforme réservée aux personnes majeures. Données privées et sécurisées.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
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
