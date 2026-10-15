// Falchi, colombe e calamità
// Simulazione pura (niente React): ogni funzione restituisce un nuovo stato.
// Il generatore casuale è salvato nello stato, quindi lo stesso seme dà
// sempre la stessa storia.
//
// Modello deterministico (dinamica del replicatore): falchi e colombe sono
// numeri reali, non individui estratti a caso. Il caso decide solo QUANDO
// arriva una calamità e QUALE. I conteggi interi servono solo per mostrare
// i pallini: si arrotonda alla fine, mai durante il calcolo, così la
// popolazione non si "incastra" vicino all'equilibrio.
//
// Una generazione:
//   1. guadagno medio di falchi e colombe, data la quota p di falchi:
//        falco:   p·(V − C)/2 + (1 − p)·V
//        colomba: (1 − p)·V/2
//   2. riproduzione: K figli divisi in proporzione a (quota × fitness),
//      con fitness = 1 + C/2 + guadagno medio;
//   3. calamità (a volte, al massimo MAX_CALAMITA, solo fra PRIMA_CALAMITA e ULTIMA_CALAMITA
//      e a distanza di almeno TREGUA generazioni l'una dall'altra): un'epidemia uccide metà dei falchi o
//      un predatore metà delle colombe. La prima è a caso, poi si alternano,
//      così vengono colpite entrambe le parti.

export const K = 200; // individui nel pascolo
export const V = 50; // valore della risorsa
export const C = 100; // costo di una ferita
export const QUOTA_FALCHI_EQUILIBRIO = Math.min(V / C, 1);
export const GENERAZIONI = 100; // durata della simulazione
export const PRIMA_CALAMITA = 20; // prima di questa generazione niente calamità: la popolazione raggiunge l'equilibrio
export const ULTIMA_CALAMITA = 75; // dopo questa generazione non succedono più calamità
export const TREGUA = 15; // distanza minima fra due calamità, per vedere il ritorno completo
export const MAX_CALAMITA = 4; // calamità al massimo in una simulazione

export const FREQUENZE = {
  nessuna: { nome: 'Nessuna', prob: 0 },
  rare: { nome: 'Rare', prob: 0.05 },
  frequenti: { nome: 'Frequenti', prob: 0.15 },
};

export const CALAMITA = {
  epidemia: {
    nome: 'Epidemia',
    icona: '🦠',
    colpisce: 'falchi',
    quota: 0.5,
    spiegazione: 'Le ferite degli scontri si infettano: muore metà dei falchi.',
  },
  predatore: {
    nome: 'Predatore',
    icona: '🦊',
    colpisce: 'colombe',
    quota: 0.5,
    spiegazione: 'Una volpe entra nel pascolo: le colombe non si difendono e ne cattura metà.',
  },
};

// Generatore LCG a 32 bit
function generatore(seme) {
  let stato = seme >>> 0;
  const random = () => {
    stato = (Math.imul(1664525, stato) + 1013904223) >>> 0;
    return stato / 4294967296;
  };
  random.stato = () => stato;
  return random;
}

// Conteggi interi da mostrare: la somma resta quella vera (K, oppure K meno
// gli uccisi nella generazione di una calamità)
export function conteggiVisibili(stato) {
  const totale = Math.round(stato.falchi + stato.colombe);
  const falchi = Math.round(stato.falchi);
  const morti = stato.calamita ? K - totale : 0;
  return { falchi, colombe: totale - falchi, morti };
}

// Guadagno di a contro b nel gioco Falco-Colomba
export function payoff(a, b, v = V, c = C) {
  if (a === 'H' && b === 'H') return (v - c) / 2;
  if (a === 'H') return v;
  if (b === 'H') return 0;
  return v / 2;
}

// Fitness di base: rende positiva anche la fitness peggiore, b + (V − C)/2
export const BASE = 1 + C / 2;

// Fitness media di falchi (fH) e colombe (fD) quando la quota di falchi è p
export function fitness(p) {
  return {
    fH: BASE + p * payoff('H', 'H') + (1 - p) * payoff('H', 'D'),
    fD: BASE + p * payoff('D', 'H') + (1 - p) * payoff('D', 'D'),
  };
}

// Dinamica del replicatore: quota di falchi della generazione successiva
export function prossimaQuota(p) {
  const { fH, fD } = fitness(p);
  return (p * fH) / (p * fH + (1 - p) * fD);
}

export function nuovaSimulazione(seme = 42, falchiIniziali = 20) {
  if (!Number.isInteger(seme) || seme < 0 || seme > 0xffffffff)
    throw new RangeError('Seme non valido.');
  const falchi = Math.max(0, Math.min(K, falchiIniziali));
  const colombe = K - falchi;
  return {
    seme,
    rng: seme >>> 0,
    generazione: 0,
    falchi,
    colombe,
    // calamità della generazione corrente (null se non c'è stata)
    calamita: null,
    ultimaCalamita: null, // { generazione, tipo } dell'ultima calamità
    finita: false,
    storico: [{ generazione: 0, falchi, colombe, calamita: null, morti: 0 }],
  };
}

export function avanza(stato, probCalamita = 0) {
  if (stato.generazione >= GENERAZIONI) return stato;
  const random = generatore(stato.rng);
  const n = stato.falchi + stato.colombe;
  let falchi = stato.falchi;
  let colombe = stato.colombe;

  if (n > 0) {
    // 1–2. Guadagni medi e riproduzione (vedi prossimaQuota)
    falchi = K * prossimaQuota(falchi / n);
    colombe = K - falchi;
  }

  // 3. Calamità (solo fino alla generazione ULTIMA_CALAMITA)
  const generazione = stato.generazione + 1;
  let calamita = null;
  let morti = 0;
  const ultima = stato.ultimaCalamita;
  const contate = stato.storico.filter((p) => p.calamita).length;
  const possibile =
    generazione >= PRIMA_CALAMITA &&
    generazione <= ULTIMA_CALAMITA &&
    contate < MAX_CALAMITA &&
    (!ultima || generazione - ultima.generazione >= TREGUA);
  if (possibile && random() < probCalamita) {
    let tipo;
    if (!ultima) tipo = random() < 0.5 ? 'epidemia' : 'predatore';
    else tipo = ultima.tipo === 'epidemia' ? 'predatore' : 'epidemia';
    const info = CALAMITA[tipo];
    if (info.colpisce === 'falchi') {
      morti = falchi * info.quota;
      falchi -= morti;
    } else {
      morti = colombe * info.quota;
      colombe -= morti;
    }
    calamita = tipo;
  }

  return {
    ...stato,
    rng: random.stato(),
    generazione,
    falchi,
    colombe,
    calamita: calamita ? { tipo: calamita, morti } : null,
    ultimaCalamita: calamita ? { generazione, tipo: calamita } : ultima,
    finita: generazione >= GENERAZIONI,
    storico: [...stato.storico, { generazione, falchi, colombe, calamita, morti }],
  };
}

// Per ogni calamità: dopo quante generazioni la popolazione è tornata
// all'equilibrio, cioè con i falchi entro `soglia` individui dal valore V/C·K.
// Se arriva un'altra calamità prima del rientro, il ritorno è "interrotto".
export function ritorniAllEquilibrio(storico, soglia = 2) {
  const obiettivo = QUOTA_FALCHI_EQUILIBRIO * K;
  const risultati = [];
  storico.forEach((punto, i) => {
    if (!punto.calamita) return;
    const r = {
      generazione: punto.generazione,
      tipo: punto.calamita,
      morti: punto.morti,
      esito: 'in corso',
      rientro: null,
      durata: null,
    };
    for (let j = i + 1; j < storico.length; j++) {
      if (storico[j].calamita) {
        r.esito = 'interrotto';
        break;
      }
      if (Math.abs(storico[j].falchi - obiettivo) <= soglia) {
        r.esito = 'rientrato';
        r.rientro = storico[j].generazione;
        r.durata = storico[j].generazione - punto.generazione;
        break;
      }
    }
    risultati.push(r);
  });
  return risultati;
}
