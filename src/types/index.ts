import type { Member, Session, Settings } from '@prisma/client';

export type { Member, Session, Settings };

export type MemberWithSessions = Member & { sessions: Session[] };

export type MemberStatus = 'idle' | 'controlling' | 'suspended' | 'expired';

export interface DashboardStats {
  totalMembers: number;
  activeControls: number;
  averageCredit: number;
  usedTodaySeconds: number;
  usedThisWeekSeconds: number;
  recentSessions: Session[];
}

/** Toute réponse de commande Lovense passe par cette forme normalisée. */
export interface LovenseCommandResult {
  ok: boolean;
  code: number;
  message: string;
  raw?: unknown;
}

/** Jouet tel que renvoyé par l'API Standard / GetToys de Lovense. */
export interface LovenseToy {
  id: string;
  name: string;
  nickName?: string;
  status: 0 | 1; // 0 = déconnecté, 1 = connecté
  version?: string;
  battery?: number;
}

/** Réponse de /api/lovense/pair (Standard API - QR / pairing). */
export interface LovensePairResponse {
  code: number;
  message: string;
  result?: boolean;
  data?: {
    qr: string;
    code: string;
  };
}

/** Payload reçu sur le webhook de callback Lovense (statut / batterie / connexion). */
export interface LovenseCallbackPayload {
  uid: string;
  domain?: string;
  httpsPort?: string | number;
  wsPort?: string | number;
  wssPort?: string | number;
  httpPort?: string | number;
  platform?: string;
  utoken?: string;
  toys?: Record<
    string,
    {
      id: string;
      status: 0 | 1 | '0' | '1';
      name: string;
      nickName?: string;
      battery?: number;
      version?: string;
    }
  >;
}

export type ToyAction = 'GetToys' | 'Function' | 'Pattern' | 'Preset';

export interface StartControlPayload {
  memberId: string;
}

export interface CreditTickEvent {
  memberId: string;
  remainingCredit: number;
  elapsedSeconds: number;
  isControlling: boolean;
}
