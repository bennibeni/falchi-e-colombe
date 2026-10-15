'use client';

import Link from 'next/link';
import { useEffect, useReducer, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import MenuNavigazione from '../MenuNavigazione';
import Termine from '../Termine';
import { payoffScontro } from './simulationEngine';
import { creaStatoIniziale, simulationReducer } from './simulationState';
import { STRATEGIE, VARIANTI } from './variants';

const N = 1000; // individui
const INCONTRI = 20;
const BASE = 151;
const fmt = (x, d = 1) => Number(x).toLocaleString('it-IT', { maximumFractionDigits: d });

const OSSERVA = {
  classico: [
    'I falchi partono dal 90% e scendono verso la linea tratteggiata V/C, come nella scheda Simulazione.',
    <>
      Ma non ci si fermano: oscillano intorno all’equilibrio di qualche punto percentuale,
      generazione dopo generazione. È la <Termine id="deriva">deriva genetica</Termine>, dovuta al
      caso.
    </>,
    'Sposta V e C con i cursori: la linea dell’equilibrio si sposta e la popolazione la insegue.',
  ],
  borghese: [
    <>
      Due borghesi non combattono mai: uno è <Termine id="proprietario">proprietario</Termine> e
      attacca, l’altro è intruso e cede. Così evitano le ferite costose senza perdere il cibo.
    </>,
    <>
      Con C &gt; V il Borghese è una <Termine id="ess">strategia evolutivamente stabile</Termine>{' '}
      (Maynard Smith): spesso finisce per conquistare il pascolo, ma non in ogni partita, perché il
      caso conta.
    </>,
    'Una strategia che si estingue non ricompare: qui non ci sono mutazioni né immigrati.',
  ],
  ritorsore: [
    'Il ritorsore punisce chi attacca: contro i falchi combatte, contro le colombe si comporta da colomba.',
    <>
      Proprio per questo in una popolazione di ritorsori le colombe guadagnano quanto loro: nulla le
      frena e possono crescere per caso. Il ritorsore da solo non è una{' '}
      <Termine id="ess">strategia evolutivamente stabile</Termine>.
    </>,
    'Con quattro strategie la formula V/C non vale più: l’esito dipende dalle interazioni fra tutte.',
  ],
};

export default function ModelloCasuale() {
  const [variante, setVariante] = useState('classico');
  return (
    <main className="mx-auto max-w-4xl px-4 py-6 text-gray-900 dark:text-gray-100">
      <MenuNavigazione attiva="casuale" />
      <h1 className="text-2xl font-bold">Modello casuale: più individui, più strategie</h1>

      <p className="mt-1 text-gray-700 dark:text-gray-300">
        Qui conta il caso: {fmt(N, 0)} individui veri e strategie in più. Scegli lo scenario e premi{' '}
        <strong>▶ Avvia</strong>.
      </p>

      <nav aria-label="Scenario" className="my-4 flex flex-wrap gap-2">
        {Object.entries(VARIANTI).map(([id, v]) => (
          <button
            key={id}
            type="button"
            onClick={() => setVariante(id)}
            aria-pressed={id === variante}
            className={`rounded border px-3 py-1.5 text-sm ${
              id === variante
                ? 'border-amber-600 bg-amber-600 text-white'
                : 'border-gray-400 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            {v.menu}
          </button>
        ))}
      </nav>

      <PannelloVariante key={variante} variante={variante} />

      <Condizioni variante={variante} />

      <details className="mt-4 rounded-lg border-2 border-amber-500 bg-amber-50 p-3 text-sm dark:bg-amber-950">
        <summary className="cursor-pointer font-semibold">
          Dal modello deterministico al modello casuale: cosa cambia
        </summary>
        <div className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="font-semibold">Scheda Simulazione (deterministica)</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Conta solo la quota di falchi, un numero reale.</li>
              <li>
                Ognuno ottiene il guadagno <em>medio</em>: niente caso negli incontri e nelle
                nascite.
              </li>
              <li>
                La popolazione arriva all’equilibrio V/C (a meno di un errore piccolissimo) e ci
                torna dopo ogni calamità.
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Questa scheda (casuale)</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>
                {fmt(N, 0)} individui veri: ognuno fa {INCONTRI} incontri con avversari estratti a
                caso.
              </li>
              <li>
                I figli sono estratti a caso, in proporzione alla{' '}
                <Termine id="fitness">fitness</Termine> ({BASE} + guadagno medio).
              </li>
              <li>
                Il caso non si compensa: la popolazione <strong>oscilla</strong> intorno
                all’equilibrio e una strategia può persino estinguersi.
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-3">
          In più la complessità cresce: oltre a falchi e colombe entrano strategie più furbe, il{' '}
          <strong style={{ color: STRATEGIE.B.colore }}>Borghese</strong> e il{' '}
          <strong style={{ color: STRATEGIE.R.colore }}>Ritorsore</strong>. Qui non ci sono
          calamità: il disturbo è il caso stesso.
        </p>
      </details>

      <details className="mt-4 rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-700">
        <summary className="cursor-pointer font-semibold">Come funziona il modello casuale</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            La popolazione ha {fmt(N, 0)} individui. A ogni generazione si fanno {INCONTRI} turni di
            incontri: in ogni turno la popolazione viene rimescolata a caso e divisa in coppie, così
            tutti giocano una volta e nessuno incontra se stesso.
          </li>
          <li>
            Ogni incontro dà i guadagni della tabella. Il guadagno di ciascuno è la media sui suoi{' '}
            {INCONTRI} incontri: il numero di incontri cambia quanto è precisa la stima, non la sua
            scala.
          </li>
          <li>
            La fitness è {BASE} + guadagno medio. La base resta fissa al variare dei cursori ed è
            abbastanza grande da rendere ogni fitness positiva per V fra 10 e 150 e C fra 10 e 300.
          </li>
          <li>
            I {fmt(N, 0)} figli si estraggono a caso, con rimpiazzo, in proporzione alla fitness
            totale di ciascuna strategia: è lo stesso che scegliere ogni volta un genitore a caso
            pesato per la sua fitness.
          </li>
          <li>
            Non ci sono mutazioni né immigrati: una strategia estinta non ricompare, anche se cambi
            V e C.
          </li>
          <li>
            Il Borghese è proprietario o intruso a caso a ogni incontro (uno dei due ruoli per
            ciascun giocatore). Il Ritorsore reagisce all’intenzione di attaccare dell’avversario
            nello stesso incontro; due ritorsori, o un ritorsore e una colomba, si dividono il cibo
            senza combattere.
          </li>
          <li>
            La linea V/C del grafico è il riferimento teorico del modello deterministico, valido
            solo con due strategie: non garantisce che una singola partita casuale ci arrivi o ci
            resti.
          </li>
          <li>Lo stesso seme e gli stessi valori di V e C producono sempre la stessa partita.</li>
        </ul>
      </details>

      <Perche variante={variante} />
    </main>
  );
}

function PannelloVariante({ variante }) {
  const conf = VARIANTI[variante];
  const strategie = Object.keys(conf.iniziali);
  const [V, setV] = useState(50);
  const [C, setC] = useState(100);
  const [ambiguita, setAmbiguita] = useState(0); // solo nella variante con il Borghese
  const [inCorso, setInCorso] = useState(false);
  const [stato, dispatch] = useReducer(simulationReducer, undefined, () =>
    creaStatoIniziale(42, variante),
  );
  const { conteggi, generazione, cronologia } = stato;

  useEffect(() => {
    if (!inCorso) return undefined;
    const id = setInterval(() => dispatch({ type: 'step', valore: V, costo: C, ambiguita }), 200);
    return () => clearInterval(id);
  }, [inCorso, V, C, ambiguita]);

  // Media e oscillazione delle ultime 50 generazioni
  const ultime = cronologia.slice(-50);
  const statistiche = strategie.map((s) => {
    const valori = ultime.map((p) => p[STRATEGIE[s].nome]);
    return {
      s,
      media: valori.reduce((a, b) => a + b, 0) / valori.length,
      min: Math.min(...valori),
      max: Math.max(...valori),
    };
  });

  return (
    <>
      <p className="text-sm text-gray-700 dark:text-gray-300">{conf.descrizione}</p>

      {/* Cursori */}
      <section className="mt-3 grid gap-4 rounded-lg border border-gray-300 p-3 text-sm sm:grid-cols-2 dark:border-gray-700">
        <label className="flex flex-col gap-1">
          <span>
            Cibo <strong>V = {V}</strong>
          </span>
          <input
            type="range"
            min={10}
            max={150}
            value={V}
            onChange={(e) => setV(Number(e.target.value))}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span>
            Ferita <strong>C = {C}</strong>
          </span>
          <input
            type="range"
            min={10}
            max={300}
            value={C}
            onChange={(e) => setC(Number(e.target.value))}
          />
        </label>
        {variante === 'classico' && (
          <p className="sm:col-span-2">
            Equilibrio teorico: <strong>{fmt(Math.min(V / C, 1) * 100)}% di falchi</strong>
            {V >= C && ' (con V ≥ C conviene sempre combattere: vincono i falchi)'}.
          </p>
        )}
      </section>

      {/* Comandi */}
      <section className="my-4 flex flex-wrap gap-3 text-sm">
        <button
          type="button"
          onClick={() => setInCorso((x) => !x)}
          className="rounded bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700"
        >
          {inCorso ? '⏸ Pausa' : '▶ Avvia'}
        </button>
        <button
          type="button"
          disabled={inCorso}
          onClick={() => dispatch({ type: 'step', valore: V, costo: C, ambiguita })}
          className="rounded border px-4 py-2 hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/10"
        >
          +1 generazione
        </button>
        <button
          type="button"
          onClick={() => {
            setInCorso(false);
            dispatch({ type: 'reset', seme: Math.floor(Math.random() * 1e6) });
          }}
          className="rounded border px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10"
        >
          Ricomincia
        </button>
        <span className="self-center">
          Generazione <strong>{generazione}</strong>
        </span>
      </section>

      <section className="mb-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
        {statistiche.map(({ s, media, min, max }) => (
          <div key={s} className="rounded-lg border border-gray-300 p-2 dark:border-gray-700">
            <div className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">
              {STRATEGIE[s].nome}
            </div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: STRATEGIE[s].colore }}>
              {fmt((conteggi[s] / N) * 100)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{conteggi[s]} individui</div>
            {ultime.length > 1 && (
              <div className="mt-1 text-xs">
                ultime {ultime.length} gen.: media {fmt(media)}%, da {fmt(min)} a {fmt(max)}%
              </div>
            )}
          </div>
        ))}
      </section>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cronologia} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.15} />
            <XAxis
              dataKey="gen"
              type="number"
              domain={['dataMin', 'dataMax']}
              allowDecimals={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} width={48} />
            <Tooltip
              formatter={(v, nome) => [`${fmt(v)}%`, nome]}
              labelFormatter={(g) => `Generazione ${g}`}
            />
            <Legend />
            {variante === 'classico' && (
              <ReferenceLine
                y={Math.min(V / C, 1) * 100}
                stroke="#6b7280"
                strokeDasharray="6 4"
                label={{ value: 'equilibrio V/C', position: 'insideBottomRight', fontSize: 12 }}
              />
            )}
            {strategie.map((s) => (
              <Line
                key={s}
                dataKey={STRATEGIE[s].nome}
                stroke={STRATEGIE[s].colore}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
        Il grafico tiene le ultime 1.000 generazioni. Cambiando numero di strategie si ricomincia da
        capo.
      </p>

      {variante === 'borghese' && (
        <FarfallaDeiBoschi ambiguita={ambiguita} setAmbiguita={setAmbiguita} V={V} C={C} />
      )}
      <details open className="mt-4 rounded-lg border-2 border-amber-500 p-3 text-sm">
        <summary className="cursor-pointer font-semibold">Cosa osservare</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {OSSERVA[variante].map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </details>
      <details className="mt-4 rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-700">
        <summary className="cursor-pointer font-semibold">Le strategie in gioco</summary>
        <section className="mt-2 grid gap-2 sm:grid-cols-2">
          {strategie.map((s) => (
            <div key={s} className="rounded border border-gray-300 p-2 dark:border-gray-700">
              <strong style={{ color: STRATEGIE[s].colore }}>{STRATEGIE[s].nome}</strong>:{' '}
              {STRATEGIE[s].regola}
              {s === 'B' && (
                <>
                  {' '}
                  Vedi <Termine id="proprietario">proprietario</Termine>.
                </>
              )}
            </div>
          ))}
        </section>
      </details>
      <details className="mt-4 rounded-lg border border-gray-300 text-sm dark:border-gray-700">
        <summary className="cursor-pointer p-3 font-semibold">Tabella dei guadagni</summary>
        <Matrice strategie={strategie} V={V} C={C} ambiguita={ambiguita} />
      </details>
    </>
  );
}

// Guadagno medio (su proprietario e intruso) di chi gioca la riga contro chi gioca la colonna
function Matrice({ strategie, V, C, ambiguita = 0 }) {
  const medio = (a, b) =>
    ((1 - ambiguita) * (payoffScontro(a, b, true, V, C)[0] + payoffScontro(a, b, false, V, C)[0])) /
      2 +
    ambiguita * payoffScontro(a, b, true, V, C, true)[0];
  return (
    <section className="overflow-x-auto px-3 pb-3">
      <p className="mb-1">
        Guadagno medio per incontro di chi gioca la riga contro chi gioca la colonna (V = {V}, C ={' '}
        {C}):
      </p>
      <table className="border-collapse text-center tabular-nums">
        <thead>
          <tr>
            <th className="p-1.5" />
            {strategie.map((b) => (
              <th key={b} className="p-1.5 font-normal">
                contro {STRATEGIE[b].nome}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {strategie.map((a) => (
            <tr key={a}>
              <th className="p-1.5 text-left" style={{ color: STRATEGIE[a].colore }}>
                {STRATEGIE[a].nome}
              </th>
              {strategie.map((b) => (
                <td key={b} className="p-1.5">
                  {fmt(medio(a, b), 2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
        Per il Borghese il valore è la media fra le volte in cui è proprietario e quelle in cui è
        intruso
        {ambiguita > 0 &&
          `, tenendo conto che nel ${Math.round(ambiguita * 100)}% degli incontri i ruoli sono ambigui`}
        .
      </p>
    </section>
  );
}

// Un caso reale del Borghese, con un cursore per rendere ambigui i ruoli
function FarfallaDeiBoschi({ ambiguita, setAmbiguita, V, C }) {
  // Sopra questa quota di incontri ambigui le colombe guadagnano più dei borghesi (vedi testo)
  const soglia = 2 * C > V ? V / (2 * C - V) : 0;
  const pct = (x) => `${Math.round(x * 100)}%`;
  return (
    <section
      aria-labelledby="farfalla"
      className="mt-3 rounded-lg border-2 border-violet-400 bg-violet-50 p-3 text-sm dark:bg-violet-950"
    >
      <h3 id="farfalla" className="text-base font-semibold">
        🦋 Un caso reale: la farfalla dei boschi
      </h3>
      <p className="mt-1">
        Nei boschi europei vive la <em>Pararge aegeria</em>, una farfalla marrone a macchie chiare.
        I maschi aspettano le femmine nelle macchie di sole che filtrano fra gli alberi. Nel 1978 il
        biologo Nicholas Davies osservò che quando un intruso arriva in una macchia già occupata, i
        due fanno un breve volo a spirale e poi l’intruso se ne va: vince quasi sempre chi c’era
        prima. È la regola del <strong style={{ color: STRATEGIE.B.colore }}>Borghese</strong>: «il
        proprietario resta, l’intruso cede», senza un vero combattimento.
      </p>
      <p className="mt-2">
        Davies fece anche un esperimento: riuscì a far sì che due maschi si credessero{' '}
        <strong>entrambi</strong> proprietari della stessa macchia. Allora nessuno cedeva e il
        duello in volo durava molto più a lungo. La convenzione funziona solo finché i ruoli sono
        chiari. (Studi successivi hanno discusso questa interpretazione, ma resta l’esempio
        classico.)
      </p>
      <label className="mt-3 flex flex-col gap-1">
        <span>
          Ruoli ambigui: <strong>{pct(ambiguita)}</strong> degli incontri, in cui ciascuno si crede
          proprietario e due borghesi combattono come due falchi
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={ambiguita}
          onChange={(e) => setAmbiguita(Number(e.target.value))}
        />
      </label>
      <p className="mt-2">
        Prova: con pochi incontri ambigui il Borghese vince ancora. Ma ogni scontro fra borghesi
        costa una ferita, e con V = {V} e C = {C}, oltre circa il <strong>{pct(soglia)}</strong> di
        incontri ambigui una colomba guadagna più di un borghese: le colombe possono invadere e il
        Borghese perde il suo vantaggio. Il cambiamento è lento, perché il Borghese parte già in
        vantaggio: lascia correre qualche centinaio di generazioni e guarda il grafico.
      </p>
    </section>
  );
}

// Le condizioni dell'esperimento, scritte come scelte del modello
function Condizioni({ variante }) {
  const iniziali = VARIANTI[variante].iniziali;
  const partenza = Object.entries(iniziali)
    .map(([s, x]) => `${fmt((x / N) * 100, 0)}% ${STRATEGIE[s].nome.toLowerCase()}`)
    .join(', ');
  return (
    <details className="mt-6 rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-700">
      <summary className="cursor-pointer font-semibold">Condizioni dell’esperimento</summary>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>
          <strong>Modello casuale</strong> con {fmt(N, 0)} individui, {INCONTRI} incontri a testa
          per generazione e fitness {BASE} + guadagno medio. Partenza: {partenza}. Seme iniziale 42;
          «Ricomincia» ne sceglie uno a caso.
        </li>
        <li>
          Nessuna calamità, nessuna mutazione, nessun immigrato: una strategia estinta non torna.
        </li>
        <li>
          <strong>Cosa vuol dire «equilibrio» qui.</strong> La popolazione non si ferma su un
          valore: oscilla intorno a esso di qualche punto percentuale. Per questo le schede mostrano
          media e intervallo delle ultime 50 generazioni.
        </li>
        <li>
          La linea V/C del grafico è il riferimento del modello deterministico e vale solo con due
          strategie; con tre o quattro l’esito dipende da tutta la tabella dei guadagni e può
          cambiare da una partita all’altra.
        </li>
      </ul>
    </details>
  );
}

// Spiegazione breve, diversa per ogni scenario, con rimando agli Approfondimenti
function Perche({ variante }) {
  const testi = {
    classico: {
      titolo: 'Perché la popolazione oscilla intorno all’equilibrio',
      paragrafi: [
        <>
          Come nella scheda Simulazione, la selezione spinge i falchi verso la quota V/C: se sono
          troppi si feriscono fra loro, se sono pochi prosperano. Qui però la spinta è più debole
          (la fitness di base è {BASE}) e, soprattutto, a ogni generazione i {fmt(N, 0)} figli
          vengono estratti a caso.
        </>,
        <>
          Il caso sposta la popolazione di circa 16 individui a generazione, la selezione ne
          recupera solo una piccola parte: le due forze si bilanciano in un’oscillazione permanente
          di qualche punto percentuale intorno all’equilibrio (con V = 50 e C = 100, circa ±4–5
          punti). È la <Termine id="deriva">deriva genetica</Termine>.
        </>,
      ],
      sezioni: '7 e 9',
    },
    borghese: {
      titolo: 'Perché il Borghese tende a vincere',
      paragrafi: [
        <>
          Con V = 50 e C = 100, in una popolazione di{' '}
          <strong style={{ color: STRATEGIE.B.colore }}>borghesi</strong> ognuno guadagna in media
          25 a incontro, senza mai ferirsi. Chi prova una strategia diversa guadagna meno: un falco
          12,5, una colomba 12,5. Nessun «invasore» può diffondersi: il Borghese è una{' '}
          <Termine id="ess">strategia evolutivamente stabile</Termine>.
        </>,
        <>
          Il suo vantaggio dipende però da una convenzione: che i ruoli di{' '}
          <Termine id="proprietario">proprietario</Termine> e intruso siano chiari. Se sono spesso
          ambigui, due borghesi combattono e le colombe possono invadere: provalo con il cursore
          «Ruoli ambigui» nel riquadro della farfalla.
        </>,
      ],
      sezioni: '4 e 11',
    },
    ritorsore: {
      titolo: 'Perché il Ritorsore non vince da solo',
      paragrafi: [
        <>
          In una popolazione di <strong style={{ color: STRATEGIE.R.colore }}>ritorsori</strong> una
          colomba guadagna esattamente quanto un ritorsore, 25, perché nessuno dei due attacca.
          Niente la svantaggia: le colombe possono crescere per caso e, quando sono tante, i falchi
          tornano a prosperare. Il ritorsore punisce chi attacca, ma non si difende da chi non
          attacca: da solo non è una <Termine id="ess">strategia evolutivamente stabile</Termine>.
        </>,
        <>
          Il Borghese invece resiste a tutti, ritorsore compreso (contro una popolazione di borghesi
          un ritorsore guadagna 0, un borghese 25): per questo, quando le quattro strategie sono
          insieme, spesso è il Borghese a prevalere.
        </>,
      ],
      sezioni: '4 e 11',
    },
  };
  const t = testi[variante];
  return (
    <section
      aria-labelledby="perche"
      className="mt-4 rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-700"
    >
      <h2 id="perche" className="mb-2 font-semibold">
        {t.titolo}
      </h2>
      {t.paragrafi.map((p, i) => (
        <p key={i} className={i ? 'mt-2' : ''}>
          {p}
        </p>
      ))}
      <p className="mt-2">
        Il calcolo completo è negli{' '}
        <Link href="/approfondimenti" className="font-semibold underline">
          Approfondimenti
        </Link>{' '}
        (sezioni {t.sezioni}).
      </p>
    </section>
  );
}
