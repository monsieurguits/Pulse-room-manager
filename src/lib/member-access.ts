import { db } from '@/lib/db';

export async function resolveMemberId(input: { memberId?: string; secureToken?: string }): Promise<string> {
  if (input.secureToken) {
    const member = await db.member.findUnique({
      where: { secureToken: input.secureToken },
      select: { id: true },
    });
    if (!member) throw new Error('Lien de contrôle invalide.');
    return member.id;
  }

  if (input.memberId) return input.memberId;

  throw new Error('memberId ou secureToken requis.');
}

export async function resolvePublicMemberId(input: { secureToken?: string }): Promise<string> {
  if (!input.secureToken) throw new Error('Token de contrôle requis.');

  const member = await db.member.findUnique({
    where: { secureToken: input.secureToken },
    select: { id: true },
  });

  if (!member) throw new Error('Lien de contrôle invalide.');
  return member.id;
}
