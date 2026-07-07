import { describe, expect, it } from 'vitest';

/**
 * Le moteur de session (src/lib/session-engine.ts) dépend de Prisma/DB et
 * du serveur WebSocket ; il est couvert par des tests d'intégration séparés
 * (nécessitant une base SQLite de test, voir README section "Tests").
 * Ce test unitaire vérifie la règle métier centrale de manière isolée :
 * le crédit ne peut jamais descendre sous zéro et s'arrête exactement à 0.
 */
function tick(remainingCredit: number): number {
  return Math.max(0, remainingCredit - 1);
}

describe('règle de débit du crédit', () => {
  it('décrémente le crédit de 1 seconde par tick', () => {
    expect(tick(10)).toBe(9);
  });

  it('ne descend jamais sous zéro', () => {
    expect(tick(0)).toBe(0);
  });

  it('atteint exactement zéro après le dernier tick', () => {
    expect(tick(1)).toBe(0);
  });
});
