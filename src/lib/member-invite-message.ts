export function buildMemberInviteMessage({
  username,
  joinUrl,
  accessCode,
}: {
  username: string;
  joinUrl: string;
  accessCode: string | null;
}): string {
  if (!accessCode) {
    return [
      `Bonjour ${username},`,
      '',
      'Ton accès personnel PULSEROOM est prêt.',
      '',
      `Va sur ${joinUrl} et demande ton code au modèle pour ouvrir ton espace de contrôle.`,
      '',
      'Ce code est strictement personnel. Merci de ne pas le partager.',
    ].join('\n');
  }

  return [
    `Bonjour ${username},`,
    '',
    'Ton accès personnel PULSEROOM est prêt.',
    '',
    `Va sur ${joinUrl}`,
    '',
    `Entre ton code membre : ${accessCode}`,
    '',
    'Ce code est strictement personnel. Il te permet de consulter ton crédit disponible et de contrôler le jouet pendant les sessions autorisées.',
    '',
    'Merci de ne pas le partager.',
  ].join('\n');
}
