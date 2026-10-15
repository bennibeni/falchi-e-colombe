import { describe, it, expect } from 'vitest';
import { calcolaProssimaGenerazione as step, creaGeneratore } from './simulationEngine';
import { creaStatoIniziale, simulationReducer, MAX_PUNTI } from './simulationState';

describe('Hawk-Dove: regressioni scientifiche', () => {
  it('costi elevati sfavoriscono i falchi anziche portarli al 100%', () => {
    for (let seed = 0; seed < 20; seed++) {
      const p = step(0.9, 10, 300, 1000, 20, creaGeneratore(seed), 151);
      expect(p).toBeGreaterThan(0);
      expect(p).toBeLessThan(0.9);
    }
  });
  it('popolazioni pure sono assorbenti e non producono NaN', () => {
    expect(step(1, 100, 200)).toBe(1);
    expect(step(0, 50, 100)).toBe(0);
    expect(step(0.0001, 50, 100)).toBe(0);
    expect(step(0.9999, 50, 100)).toBe(1);
  });
  it('rispetta conteggi interi e limiti su tutto il dominio degli slider', () => {
    for (const v of [10, 50, 150])
      for (const c of [10, 100, 300]) {
        for (const p of [0.001, 0.1, 0.5, 0.9, 0.999]) {
          const next = step(p, v, c, 1000, 20, creaGeneratore(42), 151);
          expect(Number.isFinite(next)).toBe(true);
          expect(next).toBeGreaterThanOrEqual(0);
          expect(next).toBeLessThanOrEqual(1);
          expect(next * 1000).toBeCloseTo(Math.round(next * 1000), 10);
        }
      }
  });
  it('sotto e sopra V/C la selezione media ha direzioni opposte', () => {
    for (const [p, direzione] of [
      [0.1, 1],
      [0.9, -1],
    ]) {
      let somma = 0;
      for (let seed = 0; seed < 40; seed++)
        somma += step(p, 50, 100, 1000, 20, creaGeneratore(seed), 151);
      expect((somma / 40 - p) * direzione).toBeGreaterThan(0);
    }
  });
  it('rifiuta parametri invalidi prima dei cicli', () => {
    for (const args of [
      [NaN, 50, 100],
      [-0.1, 50, 100],
      [0.5, 0, 100],
      [0.5, 50, Infinity],
      [0.5, 50, 100, 1],
      [0.5, 50, 100, 3],
      [0.5, 50, 100, 1000, 0],
    ]) {
      expect(() => step(...args)).toThrow(RangeError);
    }
    expect(() => step(0.5, 10, 300, 1000, 20, creaGeneratore(42), 1)).toThrow(RangeError);
    expect(() => step(0.5, 50, 100, 1000, 20, () => 1)).toThrow(RangeError);
  });
});

describe('transizioni atomiche e Strict Mode', () => {
  it('ripetere la stessa azione sullo stesso stato non muta o duplica lo storico', () => {
    const stato = creaStatoIniziale();
    const originale = JSON.stringify(stato);
    const azione = { type: 'step', valore: 50, costo: 100 };
    expect(simulationReducer(stato, azione)).toEqual(simulationReducer(stato, azione));
    expect(JSON.stringify(stato)).toBe(originale);
  });
  it('stato e grafico coincidono ad ogni generazione anche cambiando parametri', () => {
    let stato = creaStatoIniziale();
    for (let g = 1; g <= 30; g++) {
      const valore = g < 15 ? 50 : 80;
      stato = simulationReducer(stato, { type: 'step', valore, costo: 100 });
      const ultimo = stato.cronologia.at(-1);
      expect(stato.generazione).toBe(g);
      expect(ultimo.gen).toBe(g);
      expect(ultimo.Falchi).toBe(stato.frazioneFalchi * 100);
      expect(ultimo.Falchi + ultimo.Colombe).toBeCloseTo(100);
      expect(ultimo.V).toBe(valore);
      expect(stato.cronologia).toHaveLength(g + 1);
    }
    expect(simulationReducer(stato, { type: 'reset' })).toEqual(creaStatoIniziale());
  });
  it('limita la memoria senza azzerare il numero della generazione', () => {
    let stato = { ...creaStatoIniziale(), conteggi: { H: 1000, D: 0 }, frazioneFalchi: 1 };
    for (let i = 0; i < MAX_PUNTI + 10; i++) {
      stato = simulationReducer(stato, { type: 'step', valore: 50, costo: 100 });
    }
    expect(stato.cronologia).toHaveLength(MAX_PUNTI);
    expect(stato.generazione).toBe(MAX_PUNTI + 10);
    expect(stato.cronologia.at(-1).gen).toBe(stato.generazione);
  });
});
