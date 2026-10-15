import { describe, expect, it } from 'vitest';
import { creaGeneratore, payoffScontro, prossimaPopolazione } from './simulationEngine';
import { creaStatoIniziale, simulationReducer } from './simulationState';

describe('ruoli ambigui (farfalla dei boschi)', () => {
  it('con ruoli ambigui due borghesi combattono come due falchi', () => {
    expect(payoffScontro('B', 'B', true, 50, 100, true)).toEqual([-25, -25]);
    expect(payoffScontro('B', 'D', false, 50, 100, true)).toEqual([50, 0]);
    expect(payoffScontro('B', 'B', true, 50, 100, false)).toEqual([50, 0]);
  });

  it('con ambiguità 0 le traiettorie sono identiche a quelle senza il parametro', () => {
    const conteggi = { H: 330, D: 330, B: 340 };
    const a = prossimaPopolazione(conteggi, 50, 100, 20, creaGeneratore(7), 151);
    const b = prossimaPopolazione(conteggi, 50, 100, 20, creaGeneratore(7), 151, 0);
    expect(b).toEqual(a);
  });

  it('rifiuta valori di ambiguità fuori da [0, 1]', () => {
    expect(() =>
      prossimaPopolazione({ H: 2, B: 2 }, 50, 100, 1, creaGeneratore(1), 151, 1.5),
    ).toThrow(RangeError);
  });

  it('molta ambiguità toglie il vantaggio al Borghese', () => {
    const borghesiFinali = (ambiguita) => {
      let somma = 0;
      for (let seme = 1; seme <= 5; seme++) {
        let s = creaStatoIniziale(seme, 'borghese');
        for (let g = 0; g < 150; g++)
          s = simulationReducer(s, { type: 'step', valore: 50, costo: 100, ambiguita });
        somma += s.conteggi.B;
      }
      return somma / 5;
    };
    // Il declino è lento (selezione debole): dopo 150 generazioni i borghesi sono molto meno che senza ambiguità
    expect(borghesiFinali(0)).toBeGreaterThan(950);
    expect(borghesiFinali(0.8)).toBeLessThan(600);
  });
});
