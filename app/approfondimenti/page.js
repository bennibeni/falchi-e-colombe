import Link from 'next/link';
import MenuNavigazione from '../MenuNavigazione';
import Termine from '../Termine';
import {
  BASE,
  C,
  GENERAZIONI,
  K,
  QUOTA_FALCHI_EQUILIBRIO,
  ULTIMA_CALAMITA,
  V,
  fitness,
  prossimaQuota,
} from '../simulazione';

const B = BASE; // fitness di base usata dalla simulazione
const P = QUOTA_FALCHI_EQUILIBRIO;
const GUADAGNO_EQ = P * ((V - C) / 2) + (1 - P) * V; // uguale per falchi e colombe all'equilibrio
const LAMBDA = 1 - (P * (1 - P) * (C / 2)) / (B + GUADAGNO_EQ);
const fmt = (x, d = 2) => x.toLocaleString('it-IT', { maximumFractionDigits: d });

export const metadata = { title: 'Approfondimenti' };

const INDICE = [
  '1. Il gioco Falco-Colomba',
  '2. Nessuna strategia pura funziona',
  '3. L’equilibrio di Nash',
  '4. Strategia evolutivamente stabile',
  '5. L’equazione della simulazione',
  '6. L’equilibrio attira',
  '7. Quanto è veloce il ritorno',
  '8. Perché alla fine si vedono sempre 100 e 100',
  '9. Popolazioni piccole: la deriva',
  '10. Altri valori di V e C',
  '11. Più strategie: il Borghese e il Ritorsore',
  'Per saperne di più',
];
const ancora = (titolo) =>
  titolo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export default function Approfondimenti() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 text-gray-900 dark:text-gray-100">
      <MenuNavigazione attiva="approfondimenti" />
      <h1 className="text-2xl font-bold">Approfondimenti</h1>
      <p className="mt-2 text-gray-700 dark:text-gray-300">
        Perché la popolazione della simulazione si ferma proprio a metà falchi e metà colombe, e
        perché ci ritorna dopo ogni calamità? La risposta viene dalla{' '}
        <strong>teoria dei giochi</strong> applicata all’evoluzione.
      </p>

      <section
        aria-labelledby="in-breve"
        className="mt-4 rounded-lg border-2 border-blue-500 bg-blue-50 p-3 text-sm dark:bg-blue-950"
      >
        <h2 id="in-breve" className="font-semibold">
          In breve
        </h2>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>
            Con C &gt; V nessuna strategia pura resiste: l’equilibrio è una popolazione mista con
            una quota V/C di falchi ({fmt(P * 100, 0)}%).
          </li>
          <li>
            È un equilibrio di Nash ed è evolutivamente stabile: se la popolazione se ne allontana,
            la selezione la riporta indietro.
          </li>
          <li>
            Nel modello deterministico la distanza dall’equilibrio si riduce di circa un quinto a
            ogni generazione; nel modello casuale la popolazione oscilla intorno all’equilibrio.
          </li>
          <li>
            «All’equilibrio» nelle simulazioni significa <em>entro una tolleranza</em> (2 individui
            su {K} nella tabella dei ritorni): l’equilibrio esatto si raggiunge solo al limite, dopo
            infinite generazioni.
          </li>
        </ul>
      </section>

      <nav aria-label="Indice" className="mt-4 text-sm">
        <p className="font-semibold">Indice</p>
        <ol className="mt-1 columns-1 gap-6 sm:columns-2">
          {INDICE.map((t) => (
            <li key={t}>
              <a
                href={`#${ancora(t)}`}
                className="underline decoration-dotted hover:decoration-solid"
              >
                {t}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <Sezione titolo="1. Il gioco Falco-Colomba">
        <p>
          Il gioco fu proposto dai biologi John Maynard Smith e George Price (1973) per spiegare
          perché negli animali i combattimenti fra individui della stessa specie sono spesso rituali
          e raramente mortali. Ogni incontro ha due giocatori e due strategie possibili. La tabella
          dà il guadagno di chi gioca la strategia della riga:
        </p>
        <table className="mx-auto my-3 border-collapse text-center">
          <thead>
            <tr>
              <th className="p-2" />
              <th className="p-2">contro Falco</th>
              <th className="p-2">contro Colomba</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="p-2 text-left text-red-600">Falco</th>
              <td className="p-2">(V − C)/2 = {(V - C) / 2}</td>
              <td className="p-2">V = {V}</td>
            </tr>
            <tr>
              <th className="p-2 text-left text-blue-600">Colomba</th>
              <td className="p-2">0</td>
              <td className="p-2">V/2 = {V / 2}</td>
            </tr>
          </tbody>
        </table>
        <p>
          V è il valore della risorsa contesa, C il costo di una ferita. Nella simulazione V = {V} e
          C = {C}.
        </p>
      </Sezione>

      <Sezione titolo="2. Nessuna strategia pura funziona">
        <p>
          In una popolazione di <strong>sole colombe</strong> un falco mutante guadagna V = {V} a
          ogni incontro, contro i V/2 = {V / 2} delle colombe: i falchi invadono. In una popolazione
          di <strong>soli falchi</strong> ogni scontro rende (V − C)/2 = {(V - C) / 2}, mentre una
          colomba guadagnerebbe 0, cioè di più: le colombe invadono. Quando C &gt; V, quindi, né
          «tutti falchi» né «tutte colombe» possono durare.
        </p>
      </Sezione>

      <Sezione titolo="3. L’equilibrio di Nash">
        <p>
          Un{' '}
          <strong>
            <Termine id="nash">equilibrio di Nash</Termine>
          </strong>{' '}
          (John Nash, 1950) è una situazione in cui nessun giocatore può migliorare cambiando da
          solo la propria strategia. Nel gioco Falco-Colomba simmetrico l’equilibrio è{' '}
          <em>misto</em>: ognuno gioca Falco con probabilità p. Perché nessuno abbia interesse a
          cambiare, le due strategie devono rendere lo stesso:
        </p>
        <Formula>p · (V − C)/2 + (1 − p) · V = (1 − p) · V/2</Formula>
        <p>Semplificando, p · (V − C) + (1 − p) · V = 0, cioè</p>
        <Formula>
          p = V / C = {V} / {C} = {fmt(P)}
        </Formula>
        <p>
          In una popolazione la probabilità diventa una <strong>quota</strong>: il {fmt(P * 100, 0)}
          % di falchi, cioè {fmt(P * K, 0)} individui su {K}. È il valore a cui arriva la
          simulazione.
        </p>
      </Sezione>

      <Sezione titolo="4. Strategia evolutivamente stabile">
        <p>
          Maynard Smith e Price aggiunsero un’idea più forte del semplice equilibrio: una strategia
          è <strong>evolutivamente stabile</strong> (<Termine id="ess">ESS</Termine>) se una
          popolazione che la adotta non può essere invasa da una piccola minoranza di mutanti. La
          quota V/C lo è: se i falchi aumentano un po’, si feriscono più spesso e guadagnano meno
          delle colombe; se diminuiscono, incontrano più colombe e guadagnano di più. In entrambi i
          casi la selezione spinge indietro verso V/C. È proprio quello che succede dopo ogni
          calamità.
        </p>
      </Sezione>

      <Sezione titolo="5. L’equazione della simulazione">
        <p>
          Nel modello della simulazione non ci sono {K} individui che si incontrano a caso: c’è solo
          la <strong>quota p di falchi</strong>, un numero reale fra 0 e 1. Le colombe sono 1 − p.
          Ogni individuo incontra un falco con probabilità p e una colomba con probabilità 1 − p,
          quindi la sua <Termine id="fitness">fitness</Termine> media è
        </p>
        <Formula>
          falco: f<sub>F</sub> = b + p · (V − C)/2 + (1 − p) · V
        </Formula>
        <Formula>
          colomba: f<sub>C</sub> = b + (1 − p) · V/2
        </Formula>
        <p>
          Qui b = 1 + C/2 = {B} è la <strong>fitness di base</strong>: serve solo a rendere positiva
          anche la fitness peggiore (quella di un falco fra soli falchi, b + (V − C)/2 ={' '}
          {B + (V - C) / 2}), perché non si possono avere figli «negativi». La quota di falchi della
          generazione successiva è la loro parte della fitness totale:
        </p>
        <Formula>
          p′ = p · f<sub>F</sub> / ( p · f<sub>F</sub> + (1 − p) · f<sub>C</sub> )
        </Formula>
        <p>
          È la{' '}
          <strong>
            <Termine id="replicatore">dinamica del replicatore</Termine>
          </strong>{' '}
          (Taylor e Jonker, 1978). Con gli stessi numeri si ottiene sempre lo stesso risultato:{' '}
          <strong>niente caso</strong>. Il caso nella simulazione decide solo quando arrivano le
          calamità.
        </p>
        <Esempio />
      </Sezione>

      <Sezione titolo="6. L’equilibrio attira">
        <p>Quando p = V/C = {fmt(P)}, falchi e colombe hanno la stessa fitness:</p>
        <Formula>
          f<sub>F</sub> = {B} + {fmt(P)} · ({(V - C) / 2}) + {fmt(1 - P)} · {V} ={' '}
          {fmt(fitness(P).fH, 1)} &nbsp;&nbsp; f<sub>C</sub> = {B} + {fmt(1 - P)} · {V / 2} ={' '}
          {fmt(fitness(P).fD, 1)}
        </Formula>
        <p>
          quindi p′ = p: la popolazione <strong>non si muove più</strong>. Se p è un po’ più alta, i
          falchi si scontrano più spesso fra loro e hanno fitness minore delle colombe, quindi p
          scende; se è più bassa succede il contrario. Vicino all’equilibrio la distanza ε = p −
          V/C, a ogni generazione, diventa
        </p>
        <Formula>
          ε′ ≈ λ · ε, &nbsp; λ = 1 − p(1 − p) · (C/2) / f̄ = 1 − {fmt(P * (1 - P))} · {C / 2} /{' '}
          {fmt(B + GUADAGNO_EQ, 1)} ≈ {fmt(LAMBDA, 3)}
        </Formula>
        <p>
          dove f̄ = {fmt(B + GUADAGNO_EQ, 1)} è la fitness all’equilibrio. (Si ottiene derivando p′
          rispetto a p nel punto di equilibrio: f<sub>F</sub> − f<sub>C</sub> diminuisce di C/2 per
          ogni unità di p.) A ogni generazione resta circa l’{fmt(LAMBDA * 100, 0)}% della distanza:{' '}
          <strong>la distanza si riduce di circa un quinto</strong>.
        </p>
      </Sezione>

      <Sezione titolo="7. Quanto è veloce il ritorno">
        <p>
          Una calamità uccide metà dei falchi o metà delle colombe. Partendo dall’equilibrio (
          {fmt(P * K, 0)} e {fmt((1 - P) * K, 0)}), restano {fmt((P * K) / 2, 0)} falchi e{' '}
          {fmt((1 - P) * K, 0)} colombe, oppure il contrario: p diventa 1/3 o 2/3, cioè{' '}
          <strong>1/6 di distanza</strong> dall’equilibrio, circa {fmt(K / 6, 0)} individui su {K}.
          Per scendere sotto 2 individui servono circa
        </p>
        <Formula>
          ln(2 / {fmt(K / 6, 0)}) / ln({fmt(LAMBDA, 3)}) ≈{' '}
          {fmt(Math.log(2 / (K / 6)) / Math.log(LAMBDA), 0)} generazioni
        </Formula>
        <p>che è ciò che misura la tabella «Ritorno all’equilibrio» nella simulazione.</p>
      </Sezione>

      <Sezione titolo="8. Perché alla fine si vedono sempre 100 e 100">
        <p>
          L’ultima calamità può arrivare alla generazione {ULTIMA_CALAMITA}. Da lì alla{' '}
          {GENERAZIONI} passano {GENERAZIONI - ULTIMA_CALAMITA} generazioni, e la distanza viene
          moltiplicata per
        </p>
        <Formula>
          {fmt(LAMBDA, 3)}
          <sup>{GENERAZIONI - ULTIMA_CALAMITA}</sup> ≈{' '}
          {(LAMBDA ** (GENERAZIONI - ULTIMA_CALAMITA)).toLocaleString('it-IT', {
            maximumSignificantDigits: 2,
          })}
        </Formula>
        <p>
          cioè si riduce di circa {fmt(1 / LAMBDA ** (GENERAZIONI - ULTIMA_CALAMITA), 0)} volte. Su{' '}
          {K} individui restano circa {K} × 1/6 ×{' '}
          {(LAMBDA ** (GENERAZIONI - ULTIMA_CALAMITA)).toLocaleString('it-IT', {
            maximumSignificantDigits: 2,
          })}{' '}
          ≈ {fmt((K / 6) * LAMBDA ** (GENERAZIONI - ULTIMA_CALAMITA))} individui di differenza (in
          2.000 simulazioni al massimo 0,18, perché lontano dall’equilibrio il ritorno è un po’ più
          lento): meno di mezzo individuo, quindi arrotondando si vede sempre {fmt(P * K, 0)} e{' '}
          {fmt((1 - P) * K, 0)}. Il valore esatto è scritto nel riquadro finale della simulazione.
        </p>
        <p>
          Per questo nel calcolo p resta un <strong>numero reale</strong> e si arrotonda solo per
          disegnare i pallini. Se si arrotondasse a ogni generazione, vicino all’equilibrio la
          spinta diventerebbe più piccola di mezzo individuo e l’arrotondamento la annullerebbe: la
          popolazione si potrebbe «incastrare», per esempio a 101 o 102 falchi, senza arrivare mai a{' '}
          {fmt(P * K, 0)}.
        </p>
      </Sezione>

      <Sezione titolo="9. Popolazioni piccole: la deriva">
        <p>
          In una popolazione vera di {K} individui, chi incontra chi e chi nasce sono estrazioni
          casuali. Ogni generazione il caso sposta i falchi di circa ±
          {fmt(Math.sqrt(K * P * (1 - P)), 0)} individui, mentre la selezione ne recupera solo il{' '}
          {fmt((1 - LAMBDA) * 100, 0)}%: la popolazione oscilla in permanenza intorno
          all’equilibrio, di circa ±
          {fmt(Math.sqrt(K * P * (1 - P)) / Math.sqrt(1 - LAMBDA ** 2), 0)} falchi. È la{' '}
          <strong>
            <Termine id="deriva">deriva genetica</Termine>
          </strong>
          : più la popolazione è piccola, più conta il caso. La scheda{' '}
          <Link href="/casuale" className="underline">
            Modello casuale
          </Link>{' '}
          usa un modello di questo tipo, con 1.000 individui e una selezione più debole (fitness di
          base 151): lì le oscillazioni sono di qualche punto percentuale.
        </p>
      </Sezione>

      <Sezione titolo="10. Altri valori di V e C">
        <table className="mx-auto my-2 border-collapse text-center">
          <thead>
            <tr>
              <th className="p-2">V</th>
              <th className="p-2">C</th>
              <th className="p-2">Falchi all’equilibrio</th>
            </tr>
          </thead>
          <tbody>
            {[
              [20, 100],
              [50, 100],
              [80, 100],
              [100, 100],
              [150, 100],
            ].map(([v, c]) => (
              <tr key={`${v}-${c}`}>
                <td className="p-2">{v}</td>
                <td className="p-2">{c}</td>
                <td className="p-2">{fmt(Math.min(v / c, 1) * 100, 0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Più la ferita costa rispetto al cibo, meno falchi ci sono. Se V ≥ C combattere conviene
          sempre e la popolazione diventa di soli falchi: è il «
          <Termine id="prigioniero">dilemma del prigioniero</Termine>» dell’evoluzione, in cui tutti
          starebbero meglio come colombe ma nessuno ha interesse a esserlo da solo.
        </p>
      </Sezione>

      <Sezione titolo="11. Più strategie: il Borghese e il Ritorsore">
        <p>
          Nella scheda «Modello casuale» entrano due strategie che usano un’informazione in più. Con
          V = 50 e C = 100, il guadagno medio di chi gioca la riga contro chi gioca la colonna è
          (per il Borghese è la media fra le volte in cui è{' '}
          <Termine id="proprietario">proprietario</Termine> e quelle in cui è intruso):
        </p>
        <table className="mx-auto my-3 border-collapse text-center tabular-nums">
          <thead>
            <tr>
              <th className="p-1.5" />
              <th className="p-1.5">F</th>
              <th className="p-1.5">C</th>
              <th className="p-1.5">B</th>
              <th className="p-1.5">R</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Falco', -25, 50, 12.5, -25],
              ['Colomba', 0, 25, 12.5, 25],
              ['Borghese', -12.5, 37.5, 25, 0],
              ['Ritorsore', -25, 25, 0, 25],
            ].map(([n, ...v]) => (
              <tr key={n}>
                <th className="p-1.5 text-left">{n}</th>
                {v.map((x, i) => (
                  <td key={i} className="p-1.5">
                    {fmt(x, 1)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          <strong>Il Borghese</strong> attacca quando è proprietario e cede quando è intruso. Due
          borghesi non combattono mai, e fra loro guadagnano 25 a testa. In una popolazione di
          borghesi ogni mutante guadagna meno: un falco 12,5, una colomba 12,5, un ritorsore 0. Per
          questo, quando C &gt; V, il Borghese è una{' '}
          <strong>
            <Termine id="ess">strategia evolutivamente stabile</Termine>
          </strong>
          : usare un’asimmetria arbitraria (chi è arrivato prima) per evitare gli scontri. Nel
          modello casuale però non vince in ogni partita: il caso può favorire le altre strategie,
          soprattutto all’inizio.
        </p>
        <p>
          <strong>Il Ritorsore</strong> si comporta da colomba e combatte solo se attaccato. In una
          popolazione di ritorsori una colomba guadagna esattamente quanto un ritorsore (25 contro i
          ritorsori, 25 fra colombe): nulla la frena e le colombe possono crescere per caso. Ma
          quando le colombe sono tante, i falchi tornano a prosperare. Il Ritorsore da solo{' '}
          <strong>non è una strategia evolutivamente stabile</strong>.
        </p>
        <p>
          Con tre o quattro strategie la formula V/C non vale più: l’esito dipende da tutta la
          tabella.
        </p>
      </Sezione>

      <Sezione titolo="Per saperne di più">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            J. Maynard Smith, G. R. Price, «The Logic of Animal Conflict», <em>Nature</em> 246
            (1973), 15–18.
          </li>
          <li>
            J. Maynard Smith, <em>Evolution and the Theory of Games</em>, Cambridge University
            Press, 1982.
          </li>
          <li>
            J. F. Nash, «Equilibrium points in n-person games», <em>PNAS</em> 36 (1950), 48–49.
          </li>
          <li>
            P. D. Taylor, L. B. Jonker, «Evolutionarily stable strategies and game dynamics»,{' '}
            <em>Mathematical Biosciences</em> 40 (1978), 145–156.
          </li>
        </ul>
      </Sezione>
    </main>
  );
}

function Sezione({ titolo, children }) {
  return (
    <section className="mt-6 scroll-mt-24" id={ancora(titolo)}>
      <h2 className="mb-2 text-lg font-semibold">{titolo}</h2>
      <div className="space-y-2 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function Formula({ children }) {
  return (
    <p className="my-2 rounded bg-gray-100 px-3 py-2 text-center font-mono dark:bg-gray-800">
      {children}
    </p>
  );
}

// Esempio numerico: le prime generazioni dopo un predatore che ha dimezzato le colombe all'equilibrio
function Esempio() {
  const righe = [];
  let p = P / (P + (1 - P) / 2); // p dopo aver tolto metà delle colombe
  for (let g = 0; g <= 6; g++) {
    const { fH, fD } = fitness(p);
    righe.push({ g, p, fH, fD });
    p = prossimaQuota(p);
  }
  return (
    <div className="my-3">
      <p>
        Esempio: un predatore ha appena dimezzato le colombe, quindi p = {fmt(righe[0].p, 3)}. Ecco
        le generazioni successive calcolate con la formula:
      </p>
      <table className="mx-auto my-2 border-collapse text-center tabular-nums">
        <thead>
          <tr className="border-b border-gray-300 dark:border-gray-700">
            <th className="px-2 py-1">gen.</th>
            <th className="px-2 py-1">p</th>
            <th className="px-2 py-1">
              f<sub>F</sub>
            </th>
            <th className="px-2 py-1">
              f<sub>C</sub>
            </th>
            <th className="px-2 py-1">falchi su {K}</th>
            <th className="px-2 py-1">distanza ε</th>
          </tr>
        </thead>
        <tbody>
          {righe.map((r) => (
            <tr key={r.g}>
              <td className="px-2 py-0.5">+{r.g}</td>
              <td className="px-2 py-0.5">{fmt(r.p, 3)}</td>
              <td className="px-2 py-0.5">{fmt(r.fH, 1)}</td>
              <td className="px-2 py-0.5">{fmt(r.fD, 1)}</td>
              <td className="px-2 py-0.5">{fmt(r.p * K, 1)}</td>
              <td className="px-2 py-0.5">{fmt(r.p - P, 3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Finché i falchi sono troppi la loro fitness è minore di quella delle colombe e p scende;
        ogni riga la distanza è circa l’{fmt(LAMBDA * 100, 0)}% della precedente.
      </p>
    </div>
  );
}
