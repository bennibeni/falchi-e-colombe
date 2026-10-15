import { describe, expect, it } from 'vitest';
import {
  GENERAZIONI,
  K,
  MAX_CALAMITA,
  PRIMA_CALAMITA,
  QUOTA_FALCHI_EQUILIBRIO,
  TREGUA,
  ULTIMA_CALAMITA,
  avanza,
  conteggiVisibili,
  nuovaSimulazione,
  payoff,
  ritorniAllEquilibrio,
} from './simulazione';

const corri = (seme, generazioni, prob = 0) => {
  let s = nuovaSimulazione(seme);
  for (let g = 0; g < generazioni; g++) s = avanza(s, prob);
  return s;
};

describe('Simulazione deterministica', () => {
  it('matrice Falco-Colomba', () => {
    expect(payoff('H', 'H')).toBe(-25);
    expect(payoff('H', 'D')).toBe(50);
    expect(payoff('D', 'H')).toBe(0);
    expect(payoff('D', 'D')).toBe(25);
  });

  it('stesso seme, stessa storia', () => {
    expect(corri(7, 100, 0.15)).toEqual(corri(7, 100, 0.15));
  });

  it('senza calamità il risultato non dipende dal seme', () => {
    expect(corri(1, 60).falchi).toBe(corri(2, 60).falchi);
  });

  it('senza calamità la popolazione resta di K individui', () => {
    let s = nuovaSimulazione(3);
    for (let g = 0; g < 30; g++) {
      s = avanza(s, 0);
      expect(s.falchi + s.colombe).toBeCloseTo(K, 9);
    }
  });

  it('alla generazione 100 è sempre all’equilibrio: 100 falchi e 100 colombe', () => {
    for (let seme = 1; seme <= 300; seme++) {
      const s = corri(seme, GENERAZIONI, 0.15);
      expect(Math.abs(s.falchi - QUOTA_FALCHI_EQUILIBRIO * K)).toBeLessThan(0.5);
      expect(conteggiVisibili(s)).toEqual({ falchi: 100, colombe: 100, morti: 0 });
    }
  });

  it('la distanza dall’equilibrio si riduce di circa un quinto a generazione', () => {
    let s = nuovaSimulazione(1);
    for (let g = 0; g < 30; g++) s = avanza(s, 0);
    const d1 = s.falchi - 100;
    s = avanza(s, 0);
    const d2 = s.falchi - 100;
    expect(d2 / d1).toBeCloseTo(0.803, 2);
  });

  it('una calamità uccide esattamente metà della strategia colpita', () => {
    let s = nuovaSimulazione(5);
    let viste = 0;
    for (let g = 0; g < ULTIMA_CALAMITA; g++) {
      const prima = avanza(s, 0); // stessa riproduzione, senza calamità
      s = avanza(s, 1);
      if (!s.calamita) continue;
      viste++;
      const { tipo, morti } = s.calamita;
      if (tipo === 'epidemia') {
        expect(s.falchi).toBeCloseTo(prima.falchi / 2, 9);
        expect(s.colombe).toBeCloseTo(prima.colombe, 9);
      } else {
        expect(s.colombe).toBeCloseTo(prima.colombe / 2, 9);
        expect(s.falchi).toBeCloseTo(prima.falchi, 9);
      }
      expect(s.falchi + s.colombe + morti).toBeCloseTo(K, 9);
      const v = conteggiVisibili(s);
      expect(v.falchi + v.colombe + v.morti).toBe(K);
    }
    expect(viste).toBe(MAX_CALAMITA);
  });

  it('fra due calamità passano almeno TREGUA generazioni e i tipi si alternano', () => {
    for (let seme = 1; seme <= 200; seme++) {
      const s = corri(seme, GENERAZIONI, 0.3);
      const c = s.storico.filter((p) => p.calamita);
      for (let i = 1; i < c.length; i++) {
        expect(c[i].generazione - c[i - 1].generazione).toBeGreaterThanOrEqual(TREGUA);
        expect(c[i].calamita).not.toBe(c[i - 1].calamita);
      }
      expect(
        c.every((p) => p.generazione >= PRIMA_CALAMITA && p.generazione <= ULTIMA_CALAMITA),
      ).toBe(true);
      expect(c.length).toBeLessThanOrEqual(MAX_CALAMITA);
    }
  });

  it('dopo una calamità la popolazione torna all’equilibrio in poche generazioni', () => {
    for (let seme = 1; seme <= 200; seme++) {
      const s = corri(seme, GENERAZIONI, 0.15);
      for (const r of ritorniAllEquilibrio(s.storico, 2)) {
        if (r.esito === 'rientrato') expect(r.durata).toBeLessThanOrEqual(25);
        expect(r.esito).not.toBe('in corso'); // a fine partita sono tutte concluse
      }
    }
  });

  it('si ferma alla generazione 100, con al massimo 4 calamità fra la 20 e la 75', () => {
    const s = corri(11, 150, 1);
    expect(s.generazione).toBe(GENERAZIONI);
    expect(s.finita).toBe(true);
    expect(s.storico).toHaveLength(GENERAZIONI + 1);
    expect(s.storico.filter((p) => p.calamita).map((p) => p.generazione)).toEqual([20, 35, 50, 65]);
  });
});
