import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { AdminUser } from '@prisma/client';
import { db } from '@/lib/db';
import { getCurrentLegalTermsVersion } from '@/lib/legal-content';

export const LEGAL_TERMS_VERSION = getCurrentLegalTermsVersion();

export type CurrentAdmin = Pick<
  AdminUser,
  | 'id'
  | 'email'
  | 'name'
  | 'role'
  | 'active'
  | 'legalAcceptedAt'
  | 'legalAcceptedVersion'
  | 'subscriptionPlan'
  | 'subscriptionStartedAt'
  | 'subscriptionEndsAt'
  | 'weatherCity'
>;

const SESSION_COOKIE = 'pulse_admin_session';
const SESSION_DAYS = 14;

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): string {
  const hash = crypto.pbkdf2Sync(password, salt, 120_000, 32, 'sha256').toString('hex');
  return `pbkdf2_sha256$120000$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [algorithm, iterationsRaw, salt, hash] = stored.split('$');
  if (algorithm !== 'pbkdf2_sha256' || !iterationsRaw || !salt || !hash) return false;

  const candidate = crypto
    .pbkdf2Sync(password, salt, Number(iterationsRaw), 32, 'sha256')
    .toString('hex');

  const candidateBuffer = Buffer.from(candidate, 'hex');
  const storedBuffer = Buffer.from(hash, 'hex');
  if (candidateBuffer.length !== storedBuffer.length) return false;

  return crypto.timingSafeEqual(candidateBuffer, storedBuffer);
}

export async function ensureInitialOwner(): Promise<void> {
  const count = await db.adminUser.count();
  if (count > 0) return;

  const email = process.env.INITIAL_OWNER_EMAIL;
  const password = process.env.INITIAL_OWNER_PASSWORD;

  if (!email || !password) return;

  await db.adminUser.create({
    data: {
      email: email.toLowerCase().trim(),
      name: process.env.INITIAL_OWNER_NAME ?? 'Owner',
      role: 'OWNER',
      passwordHash: hashPassword(password),
    },
  });
}

export async function createAdminSession(userId: string): Promise<void> {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.adminSession.create({
    data: { tokenHash, userId, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await db.adminSession.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  await ensureInitialOwner();

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.adminSession.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt <= new Date() || !session.user.active) {
    if (session) {
      await db.adminSession.delete({ where: { id: session.id } }).catch(() => undefined);
    }
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    active: session.user.active,
    legalAcceptedAt: session.user.legalAcceptedAt,
    legalAcceptedVersion: session.user.legalAcceptedVersion,
    subscriptionPlan: session.user.subscriptionPlan,
    subscriptionStartedAt: session.user.subscriptionStartedAt,
    subscriptionEndsAt: session.user.subscriptionEndsAt,
    weatherCity: session.user.weatherCity,
  };
}

export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/login');
  return admin;
}

export async function requireOwner(): Promise<CurrentAdmin> {
  const admin = await requireAdmin();
  if (admin.role !== 'OWNER') redirect('/dashboard');
  return admin;
}

export function hasAcceptedCurrentLegalTerms(admin: CurrentAdmin): boolean {
  return admin.role !== 'MODEL' || admin.legalAcceptedVersion === LEGAL_TERMS_VERSION;
}

export function memberOwnerWhere(admin: CurrentAdmin) {
  return admin.role === 'OWNER' ? {} : { ownerId: admin.id };
}

export function canAccessMember(admin: CurrentAdmin, member: { ownerId: string | null }): boolean {
  return admin.role === 'OWNER' || member.ownerId === admin.id;
}

export async function assertAdminCanAccessMember(memberId: string): Promise<void> {
  const admin = await requireAdmin();
  const member = await db.member.findUnique({ where: { id: memberId }, select: { ownerId: true } });

  if (!member || !canAccessMember(admin, member)) {
    throw new Error('Membre introuvable.');
  }
}

function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
