// Voci del glossario mostrate nelle finestre «i» (componente Termine).
// Ogni voce: titolo, paragrafi (array di stringhe), un esempio e un'immagine facoltativi.
// immagine: { src (import statico), alt, didascalia }
import { BASE, C, V } from './simulazione';
import fotoNash from './immagini/nash.jpg';

export const GLOSSARIO = {
  fitness: {
    titolo: 'Fitness',
    paragrafi: [
      'In biologia evolutiva la fitness misura il successo riproduttivo: quanti figli lascia in media un individuo. Non ha niente a che vedere con la forma fisica.',
      `Nella simulazione la fitness è una fitness di base più il guadagno medio negli incontri: ${BASE} + guadagno nella scheda Simulazione, 151 + guadagno nel Modello casuale. I figli della generazione successiva si dividono in proporzione alla fitness.`,
      `La base serve solo a evitare valori negativi: un falco fra soli falchi guadagna (V − C)/2 = ${(V - C) / 2} a incontro, ma non può avere «figli negativi». Aggiungere la stessa base a tutti non cambia chi guadagna di più.`,
    ],
  },
  ess: {
    titolo: 'Strategia evolutivamente stabile (ESS)',
    paragrafi: [
      'ESS sta per «Evolutionarily Stable Strategy». Il concetto è stato introdotto da John Maynard Smith e George Price nel 1973.',
      'Una strategia è evolutivamente stabile se, quando quasi tutta la popolazione la adotta, nessuna piccola minoranza di mutanti con un’altra strategia può guadagnare di più e quindi diffondersi.',
      'In formule, indicando con G(A, B) il guadagno di A contro B: S è una ESS se per ogni altra strategia T vale G(S, S) > G(T, S), oppure G(S, S) = G(T, S) e G(S, T) > G(T, T).',
      'È un’idea più forte dell’equilibrio di Nash: ogni ESS è un equilibrio di Nash, ma non ogni equilibrio di Nash è una ESS.',
    ],
    esempio: `Nel gioco Falco-Colomba con C > V nessuna strategia pura è una ESS: tra soli falchi conviene essere colomba, tra sole colombe conviene essere falco. Lo è invece la popolazione mista con ${Math.round((V / C) * 100)}% di falchi (V/C). Con il Borghese, anche «tutti borghesi» è una ESS.`,
  },
  nash: {
    titolo: 'Equilibrio di Nash',
    immagine: {
      src: fotoNash,
      alt: 'Vecchia fotografia in bianco e nero di un uomo in giacca e cravatta',
      didascalia: 'Foto d’epoca allegata da Ben.',
    },
    paragrafi: [
      'Una situazione in cui nessun giocatore può migliorare il proprio guadagno cambiando da solo strategia, se gli altri non cambiano. Prende il nome dal matematico John Nash (1950).',
      'Un equilibrio può essere «misto»: ogni giocatore sceglie a caso fra più strategie con certe probabilità, scelte in modo che le alternative rendano esattamente lo stesso.',
    ],
    esempio: `Nel Falco-Colomba con V = ${V} e C = ${C} l’equilibrio simmetrico è giocare falco con probabilità V/C = ${(V / C).toLocaleString('it-IT')}. In una popolazione si legge come quota: ${Math.round((V / C) * 100)}% di falchi.`,
  },
  replicatore: {
    titolo: 'Dinamica del replicatore',
    paragrafi: [
      'Una regola matematica (Taylor e Jonker, 1978) che descrive come cambiano le quote delle strategie da una generazione all’altra: una strategia cresce se la sua fitness è superiore alla media e cala se è inferiore.',
      'È l’equazione p′ = p · fF / (p · fF + (1 − p) · fC) usata nella scheda Simulazione.',
      'Ogni strategia evolutivamente stabile è un punto in cui la dinamica si ferma e verso cui ritorna dopo piccoli spostamenti.',
    ],
  },
  deriva: {
    titolo: 'Deriva genetica',
    paragrafi: [
      'La variazione casuale delle frequenze delle strategie (o dei geni) da una generazione all’altra. Succede perché una popolazione finita è un campione: per puro caso alcuni individui hanno più figli di altri.',
      'Più la popolazione è piccola, più la deriva è forte. Non dipende dai guadagni: agisce anche fra strategie che rendono esattamente lo stesso.',
    ],
    esempio:
      'Nel Modello casuale la deriva fa oscillare la popolazione intorno all’equilibrio e può persino far estinguere una strategia. Nella scheda Simulazione non c’è, perché il modello è deterministico.',
  },
  prigioniero: {
    titolo: 'Dilemma del prigioniero',
    paragrafi: [
      'Il gioco più famoso della teoria dei giochi, studiato nel 1950 da Merrill Flood e Melvin Dresher; il nome e la storia sono di Albert Tucker.',
      'Due complici vengono interrogati separatamente. Se entrambi tacciono, hanno una pena lieve. Se uno confessa e l’altro tace, chi confessa è libero e l’altro ha la pena massima. Se confessano entrambi, hanno una pena intermedia.',
      'Qualunque cosa faccia l’altro, a ciascuno conviene confessare. Così entrambi confessano e stanno peggio che se avessero taciuto: la scelta conveniente per il singolo è dannosa per tutti.',
    ],
    esempio:
      'Nel Falco-Colomba succede lo stesso quando il cibo vale più della ferita (V > C): essere falco conviene sempre, quindi tutti diventano falchi e guadagnano (V − C)/2, meno dei V/2 che avrebbero se fossero tutti colombe.',
  },
  proprietario: {
    titolo: 'Proprietario e intruso',
    paragrafi: [
      'In ogni incontro del Modello casuale uno dei due individui è considerato il «proprietario» del cibo e l’altro l’«intruso». Si può immaginare che il proprietario sia chi è arrivato per primo, o chi si trova nel proprio territorio.',
      'Il ruolo non dipende dalla forza né dalla strategia: viene sorteggiato a caso a ogni incontro, con probabilità 1/2. Lo stesso individuo è proprietario in un incontro e intruso in quello dopo.',
      'Falchi, colombe e ritorsori ignorano il ruolo. Solo il Borghese lo usa: da proprietario attacca, da intruso cede senza combattere.',
      'Così due borghesi non si feriscono mai: uno prende tutto il cibo e l’altro se ne va. Poiché i ruoli sono casuali, in media ciascuno ottiene metà del cibo, come due colombe, ma senza dover condividere.',
    ],
    esempio:
      'In natura succede davvero: nella farfalla Pararge aegeria, studiata da Nicholas Davies (1978), il maschio che occupa per primo una macchia di sole nel bosco la difende, e l’intruso quasi sempre se ne va dopo un breve volo, senza un vero scontro.',
  },
};
