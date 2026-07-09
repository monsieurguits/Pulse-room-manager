export interface CreditPack {
  id: string;
  minutes: number;
  seconds: number;
  amountCents: number;
  label: string;
  popular?: boolean;
}

export const CREDIT_PACKS = [
  { id: 'credit_2_min', minutes: 2, seconds: 120, amountCents: 399, label: '2 min' },
  { id: 'credit_5_min', minutes: 5, seconds: 300, amountCents: 799, label: '5 min' },
  { id: 'credit_7_min', minutes: 7, seconds: 420, amountCents: 999, label: '7 min' },
  { id: 'credit_10_min', minutes: 10, seconds: 600, amountCents: 1399, label: '10 min', popular: true },
  { id: 'credit_15_min', minutes: 15, seconds: 900, amountCents: 1899, label: '15 min' },
  { id: 'credit_20_min', minutes: 20, seconds: 1200, amountCents: 2499, label: '20 min' },
] satisfies CreditPack[];

export function getCreditPack(packId: string): CreditPack | undefined {
  return CREDIT_PACKS.find((pack) => pack.id === packId);
}

export function formatEuros(cents: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}
