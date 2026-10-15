// Strategie e varianti del modello casuale.
// Colori allineati alla scheda Simulazione: falchi rossi, colombe blu.
export const STRATEGIE = {
  H: { nome: 'Falchi', colore: '#dc2626', regola: 'Attacca sempre.' },
  D: {
    nome: 'Colombe',
    colore: '#2563eb',
    regola: 'Non attacca mai: minaccia, divide con chi è pacifico e fugge se attaccata.',
  },
  B: {
    nome: 'Borghesi',
    colore: '#7c3aed',
    regola:
      'Rispetta la proprietà. In ogni incontro uno dei due è il «proprietario» del cibo (per esempio chi è arrivato prima) e l’altro l’«intruso»; i ruoli si sorteggiano a caso. Il borghese attacca da proprietario e cede da intruso.',
  },
  R: {
    nome: 'Ritorsori',
    colore: '#d97706',
    regola:
      'Parte pacifico come una colomba, ma se l’avversario attacca reagisce e combatte. Non ricorda gli incontri passati.',
  },
};
export const VARIANTI = {
  classico: {
    titolo: 'Falchi e colombe',
    menu: 'Falchi e colombe',
    iniziali: { H: 900, D: 100 },
    descrizione:
      'Lo stesso gioco della scheda Simulazione, ma con il caso: si parte dal 90% di falchi.',
  },
  borghese: {
    titolo: 'Falchi, colombe e borghesi',
    menu: 'Falchi, colombe e borghesi',
    iniziali: { H: 330, D: 330, B: 340 },
    descrizione:
      'Entra una strategia che usa un’informazione in più, chi è il proprietario: le tre strategie partono alla pari.',
  },
  ritorsore: {
    titolo: 'Falchi, colombe, borghesi e ritorsori',
    menu: 'Falchi, colombe, borghesi e ritorsori',
    iniziali: { H: 250, D: 250, B: 250, R: 250 },
    descrizione:
      'Entra una strategia che reagisce al comportamento dell’avversario: quattro strategie al 25% ciascuna.',
  },
};
