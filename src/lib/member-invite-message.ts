export function buildMemberInviteMessage({ username, url }: { username: string; url: string }): string {
  return [
    `Bonjour ${username},`,
    '',
    'Ton accès personnel PULSEROOM est prêt.',
    '',
    'Tu peux utiliser ce lien privé pour accéder à ton espace de contrôle :',
    url,
    '',
    'Ce lien est strictement personnel. Il te permet de consulter ton crédit disponible et de contrôler le jouet pendant les sessions autorisées.',
    '',
    'Merci de ne pas le partager.',
  ].join('\n');
}
