import crypto from 'node:crypto';
import { db } from '@/lib/db';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

export function normalizeMemberAccessCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function generateMemberAccessCode(): string {
  return Array.from({ length: CODE_LENGTH }, () => CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)]).join('');
}

export async function createUniqueMemberAccessCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = generateMemberAccessCode();
    const existing = await db.member.findUnique({ where: { accessCode: code }, select: { id: true } });
    if (!existing) return code;
  }

  throw new Error("Impossible de générer un code membre unique.");
}
