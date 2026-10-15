// Modello individuale: k incontri per individuo e riproduzione stocastica.
// Il payoff medio per incontro evita che k cambi la scala della selezione.
export function creaGeneratore(seme = 42) {
  if (!Number.isInteger(seme) || seme < 0 || seme > 0xffffffff) {
    throw new RangeError('Il seme deve essere un intero uint32.');
  }
  let stato = seme >>> 0;
  const random = () => {
    stato = (Math.imul(1664525, stato) + 1013904223) >>> 0;
    return stato / 4294967296;
  };
  random.stato = () => stato;
  return random;
}

// Ruoli complementari: proprietario1=false significa che il secondo e' proprietario.
// con entrambiProprietari=true i ruoli sono ambigui e ciascuno si crede proprietario
// (come nell'esperimento di Davies sulla farfalla Pararge aegeria).
export function payoffScontro(s1, s2, proprietario1, valore, costo, entrambiProprietari = false) {
  const intenzione1 = s1 === 'H' || (s1 === 'B' && (proprietario1 || entrambiProprietari));
  const intenzione2 = s2 === 'H' || (s2 === 'B' && (!proprietario1 || entrambiProprietari));
  const attacco1 = intenzione1 || (s1 === 'R' && intenzione2);
  const attacco2 = intenzione2 || (s2 === 'R' && intenzione1);
  if (attacco1 && attacco2) return [(valore - costo) / 2, (valore - costo) / 2];
  if (attacco1) return [valore, 0];
  if (attacco2) return [0, valore];
  return [valore / 2, valore / 2];
}

export function prossimaPopolazione(
  conteggi,
  valore,
  costo,
  incontriPerIndividuo = 20,
  random = Math.random,
  fitnessBase = 1 + costo / 2,
  ambiguita = 0,
) {
  const strategie = Object.keys(conteggi);
  const n = Object.values(conteggi).reduce((a, b) => a + b, 0);
  if (
    !strategie.length ||
    strategie.some((s) => !['H', 'D', 'B', 'R'].includes(s)) ||
    Object.values(conteggi).some((x) => !Number.isSafeInteger(x) || x < 0) ||
    !Number.isSafeInteger(n) ||
    n < 2 ||
    n % 2 ||
    !Number.isFinite(valore) ||
    valore <= 0 ||
    !Number.isFinite(costo) ||
    costo <= 0 ||
    !Number.isSafeInteger(incontriPerIndividuo) ||
    incontriPerIndividuo < 1 ||
    !Number.isFinite(ambiguita) ||
    ambiguita < 0 ||
    ambiguita > 1 ||
    !Number.isFinite(fitnessBase) ||
    fitnessBase + Math.min(0, (valore - costo) / 2) <= 0 ||
    !Number.isFinite(fitnessBase + valore) ||
    typeof random !== 'function'
  ) {
    throw new RangeError(
      'Parametri non validi: conteggi interi, N pari, k positivo e fitness positive e finite.',
    );
  }
  const estrai = () => {
    const x = random();
    if (!Number.isFinite(x) || x < 0 || x >= 1) throw new RangeError('Estrazione fuori da [0, 1).');
    return x;
  };
  if (strategie.filter((s) => conteggi[s] > 0).length === 1) return { ...conteggi };
  const popolazione = strategie.flatMap((s) => Array(conteggi[s]).fill(s));
  const punteggi = new Float64Array(n);
  const indici = Array.from({ length: n }, (_, i) => i);
  const usaRuoli = strategie.includes('B');
  for (let turno = 0; turno < incontriPerIndividuo; turno++) {
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(estrai() * (i + 1));
      [indici[i], indici[j]] = [indici[j], indici[i]];
    }
    for (let i = 0; i < n; i += 2) {
      const a = indici[i],
        b = indici[i + 1];
      const ruolo = usaRuoli ? estrai() < 0.5 : true;
      // L'estrazione in più avviene solo con ambiguita > 0: con 0 le traiettorie restano quelle senza ambiguità
      const ambigui = usaRuoli && ambiguita > 0 ? estrai() < ambiguita : false;
      const [p1, p2] = payoffScontro(popolazione[a], popolazione[b], ruolo, valore, costo, ambigui);
      punteggi[a] += p1 / incontriPerIndividuo;
      punteggi[b] += p2 / incontriPerIndividuo;
    }
  }
  const pesi = Object.fromEntries(strategie.map((s) => [s, 0]));
  const scala = fitnessBase + valore;
  punteggi.forEach((p, i) => {
    pesi[popolazione[i]] += (fitnessBase + p) / scala;
  });
  const totale = Object.values(pesi).reduce((a, b) => a + b, 0);
  if (
    !Number.isFinite(totale) ||
    totale <= 0 ||
    Object.values(pesi).some((p) => !Number.isFinite(p) || p < 0)
  ) {
    throw new RangeError('Fitness numericamente non valida.');
  }
  const presenti = strategie.filter((s) => conteggi[s] > 0);
  const nuovi = Object.fromEntries(strategie.map((s) => [s, 0]));
  for (let i = 0; i < n; i++) {
    const soglia = estrai() * totale;
    let cumulata = 0;
    let scelta = presenti.at(-1);
    for (const s of presenti) {
      cumulata += pesi[s];
      if (soglia < cumulata) {
        scelta = s;
        break;
      }
    }
    nuovi[scelta]++;
  }
  return nuovi;
}

// API compatibile con la precedente versione a due strategie.
export function calcolaProssimaGenerazione(
  frazioneFalchi,
  valore,
  costo,
  popolazioneTotale = 1000,
  incontriPerIndividuo = 20,
  random = Math.random,
  fitnessBase = 1 + costo / 2,
) {
  if (
    !Number.isFinite(frazioneFalchi) ||
    frazioneFalchi < 0 ||
    frazioneFalchi > 1 ||
    !Number.isSafeInteger(popolazioneTotale) ||
    popolazioneTotale < 2 ||
    popolazioneTotale % 2
  ) {
    throw new RangeError('Frazione o popolazione non valida.');
  }
  const h = Math.round(popolazioneTotale * frazioneFalchi);
  return (
    prossimaPopolazione(
      { H: h, D: popolazioneTotale - h },
      valore,
      costo,
      incontriPerIndividuo,
      random,
      fitnessBase,
    ).H / popolazioneTotale
  );
}
