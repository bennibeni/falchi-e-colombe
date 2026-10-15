import { describe, it, expect } from 'vitest';
import { payoffScontro, prossimaPopolazione, creaGeneratore } from './simulationEngine';
import { creaStatoIniziale, simulationReducer } from './simulationState';
import { VARIANTI, STRATEGIE } from './variants';

describe('payoff a quattro strategie', () => {
  const strategie = ['H', 'D', 'B', 'R'];
  const matrice = [
    [-25, 50, 12.5, -25],
    [0, 25, 12.5, 25],
    [-12.5, 37.5, 25, 0],
    [-25, 25, 0, 25],
  ];
  it('riproduce tutti i 16 payoff medi sui ruoli e la simmetria tra giocatori', () => {
    strategie.forEach((a, i) =>
      strategie.forEach((b, j) => {
        const proprietario = payoffScontro(a, b, true, 50, 100);
        const intruso = payoffScontro(a, b, false, 50, 100);
        expect((proprietario[0] + intruso[0]) / 2).toBe(matrice[i][j]);
        expect(proprietario).toEqual(payoffScontro(b, a, false, 50, 100).reverse());
      }),
    );
  });
  it('B rispetta il possesso e R reagisce solo agli attacchi', () => {
    expect(payoffScontro('B', 'B', true, 50, 100)).toEqual([50, 0]);
    expect(payoffScontro('R', 'B', true, 50, 100)).toEqual([25, 25]);
    expect(payoffScontro('R', 'B', false, 50, 100)).toEqual([-25, -25]);
    expect(payoffScontro('R', 'R', true, 50, 100)).toEqual([25, 25]);
  });
});

describe.each(Object.keys(VARIANTI))('variante %s', (variante) => {
  it('stato iniziale, reset, determinismo e storico sono coerenti', () => {
    let stato = creaStatoIniziale(42, variante);
    expect(stato.conteggi).toEqual(VARIANTI[variante].iniziali);
    for (let i = 1; i <= 30; i++) {
      const precedente = JSON.stringify(stato);
      const azione = { type: 'step', valore: i < 15 ? 50 : 10, costo: i < 15 ? 100 : 300 };
      const prossimo = simulationReducer(stato, azione);
      expect(prossimo).toEqual(simulationReducer(stato, azione));
      expect(JSON.stringify(stato)).toBe(precedente);
      expect(Object.values(prossimo.conteggi).reduce((a, b) => a + b, 0)).toBe(1000);
      expect(prossimo.generazione).toBe(i);
      const punto = prossimo.cronologia.at(-1);
      Object.entries(prossimo.conteggi).forEach(([s, n]) => {
        expect(Number.isInteger(n)).toBe(true);
        expect(n).toBeGreaterThanOrEqual(0);
        expect(punto[STRATEGIE[s].nome]).toBe((n / 1000) * 100);
      });
      stato = prossimo;
    }
    expect(simulationReducer(stato, { type: 'reset' })).toEqual(creaStatoIniziale(42, variante));
  });
  it('resta valida agli estremi degli slider', () => {
    for (const v of [10, 150])
      for (const c of [10, 300]) {
        const risultato = prossimaPopolazione(
          VARIANTI[variante].iniziali,
          v,
          c,
          20,
          creaGeneratore(42),
          151,
        );
        expect(Object.values(risultato).reduce((a, b) => a + b, 0)).toBe(1000);
        expect(Object.values(risultato).every((n) => Number.isInteger(n) && n >= 0)).toBe(true);
      }
  });
});

it('nessuna strategia estinta ricompare e le popolazioni pure restano pure', () => {
  for (const s of ['H', 'D', 'B', 'R']) {
    const conteggi = { H: 0, D: 0, B: 0, R: 0, [s]: 1000 };
    expect(prossimaPopolazione(conteggi, 50, 100, 20, creaGeneratore(42), 151)).toEqual(conteggi);
  }
  const risultato = prossimaPopolazione(
    { H: 500, D: 0, B: 500, R: 0 },
    50,
    100,
    20,
    creaGeneratore(42),
    151,
  );
  expect(risultato.D).toBe(0);
  expect(risultato.R).toBe(0);
});

it('rifiuta conteggi frazionari, negativi o strategie sconosciute', () => {
  for (const conteggi of [{ H: 1.5, D: 2.5 }, { H: -1, D: 3 }, { H: 1, D: 2 }, { X: 1000 }]) {
    expect(() => prossimaPopolazione(conteggi, 50, 100)).toThrow(RangeError);
  }
});
