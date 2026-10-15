import { prossimaPopolazione, creaGeneratore } from './simulationEngine';
import { VARIANTI, STRATEGIE } from './variants';

export const MAX_PUNTI = 1000;
function puntoStorico(conteggi, gen) {
  const n = Object.values(conteggi).reduce((a, b) => a + b, 0);
  return {
    gen,
    ...Object.fromEntries(
      Object.entries(conteggi).map(([s, x]) => [STRATEGIE[s].nome, (x / n) * 100]),
    ),
  };
}
export function creaStatoIniziale(seme = 42, variante = 'classico') {
  creaGeneratore(seme);
  if (!Object.hasOwn(VARIANTI, variante)) throw new RangeError('Variante sconosciuta.');
  const conteggi = { ...VARIANTI[variante].iniziali };
  return {
    variante,
    conteggi,
    frazioneFalchi: conteggi.H / 1000,
    generazione: 0,
    seme,
    cronologia: [puntoStorico(conteggi, 0)],
  };
}

// Reducer puro: ogni transizione usa il seme contenuto nello stato.
export function simulationReducer(stato, azione) {
  if (azione.type === 'reset') return creaStatoIniziale(azione.seme ?? 42, stato.variante);
  if (azione.type !== 'step') return stato;
  const random = creaGeneratore(stato.seme);
  const conteggi = prossimaPopolazione(
    stato.conteggi,
    azione.valore,
    azione.costo,
    20,
    random,
    151,
    azione.ambiguita ?? 0,
  );
  const generazione = stato.generazione + 1;
  const punto = { ...puntoStorico(conteggi, generazione), V: azione.valore, C: azione.costo };
  return {
    variante: stato.variante,
    conteggi,
    frazioneFalchi: conteggi.H / 1000,
    generazione,
    seme: random.stato(),
    cronologia: [...stato.cronologia.slice(-(MAX_PUNTI - 1)), punto],
  };
}
