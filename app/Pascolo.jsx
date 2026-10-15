'use client';

import Link from 'next/link';
import { useEffect, useReducer, useState } from 'react';
import {
  C,
  CALAMITA,
  FREQUENZE,
  GENERAZIONI,
  K,
  MAX_CALAMITA,
  PRIMA_CALAMITA,
  QUOTA_FALCHI_EQUILIBRIO,
  TREGUA,
  ULTIMA_CALAMITA,
  V,
  avanza,
  conteggiVisibili,
  nuovaSimulazione,
  ritorniAllEquilibrio,
} from './simulazione';
import GraficoQuote, { COLORI } from './GraficoQuote';
import MenuNavigazione from './MenuNavigazione';
import Termine from './Termine';

const PASSO = 200; // ms fra una generazione e l'altra (velocità fissa)
const PAUSA_CALAMITA = 1000; // ms di attesa dopo una calamità prima di riprendere
const SOGLIA_RIENTRO = 2; // individui di distanza dall'equilibrio considerati "rientrati"
const pct = (x) => `${Math.round(x * 100)}%`;
const EQ_FALCHI = Math.round(QUOTA_FALCHI_EQUILIBRIO * K);

function riduttore(stato, azione) {
  if (azione.type === 'avanza') return avanza(stato, azione.prob);
  if (azione.type === 'ricomincia') return nuovaSimulazione(azione.seme);
  throw new Error(`Azione sconosciuta: ${azione.type}`);
}

export default function Pascolo() {
  const [stato, dispatch] = useReducer(riduttore, undefined, () => nuovaSimulazione(42));
  const [avviata, setInCorso] = useState(false);
  const inCorso = avviata && !stato.finita;
  const [frequenza, setFrequenza] = useState('frequenti');
  const prob = FREQUENZE[frequenza].prob;
  const n = stato.falchi + stato.colombe;
  const visibili = conteggiVisibili(stato);
  const ritorni = ritorniAllEquilibrio(stato.storico, SOGLIA_RIENTRO);

  // Avanzamento automatico: dopo una calamità aspetta un secondo in più, poi riprende da solo
  useEffect(() => {
    if (!inCorso || stato.finita) return undefined;
    const attesa = stato.calamita ? PAUSA_CALAMITA : PASSO;
    const id = setTimeout(() => dispatch({ type: 'avanza', prob }), attesa);
    return () => clearTimeout(id);
  }, [inCorso, stato, prob]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 text-gray-900 dark:text-gray-100">
      <MenuNavigazione attiva="simulazione" />
      <h1 className="text-2xl font-bold">Falchi, colombe e calamità</h1>

      <p className="mt-1 text-gray-700 dark:text-gray-300">
        Guarda come falchi e colombe raggiungono un equilibrio e ci ritornano da soli dopo ogni
        calamità. Premi <strong>▶ Avvia</strong>.
      </p>

      {/* Comandi */}
      <section className="my-4 flex flex-wrap items-end gap-3 text-sm">
        <button
          type="button"
          disabled={stato.finita}
          onClick={() => setInCorso((x) => !x)}
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {inCorso ? '⏸ Pausa' : '▶ Avvia'}
        </button>
        <button
          type="button"
          disabled={inCorso || stato.finita}
          onClick={() => dispatch({ type: 'avanza', prob })}
          className="rounded border px-4 py-2 hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/10"
        >
          +1 generazione
        </button>
        <button
          type="button"
          onClick={() => {
            setInCorso(false);
            dispatch({ type: 'ricomincia', seme: Math.floor(Math.random() * 1e6) });
          }}
          className="rounded border px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10"
        >
          Ricomincia
        </button>
        <label className="flex flex-col gap-1">
          Calamità
          <select
            value={frequenza}
            onChange={(e) => setFrequenza(e.target.value)}
            className="rounded border border-gray-300 bg-transparent px-2 py-1 dark:border-gray-700"
          >
            {Object.entries(FREQUENZE).map(([id, f]) => (
              <option key={id} value={id} className="text-gray-900">
                {f.nome}
                {f.prob ? ` (${pct(f.prob)} a generazione)` : ''}
              </option>
            ))}
          </select>
        </label>
      </section>

      {/* Numeri */}
      <section className="mb-3 grid grid-cols-3 gap-3 text-center">
        <Numero titolo="Generazione" valore={`${stato.generazione} / ${GENERAZIONI}`} />
        <Numero
          titolo="Falchi"
          valore={visibili.falchi}
          nota={n ? pct(stato.falchi / n) : '—'}
          colore={COLORI.falchi}
        />
        <Numero
          titolo="Colombe"
          valore={visibili.colombe}
          nota={n ? pct(stato.colombe / n) : '—'}
          colore={COLORI.colombe}
        />
      </section>

      {stato.finita && <Riepilogo stato={stato} visibili={visibili} ritorni={ritorni} />}

      {/* Avviso calamità: spazio sempre riservato, così pascolo e grafico non si spostano */}
      <div aria-live="assertive" className="mb-3 h-11">
        {stato.calamita ? (
          <AvvisoCalamita calamita={stato.calamita} generazione={stato.generazione} />
        ) : (
          <StatoCalamita generazione={stato.generazione} finita={stato.finita} attive={prob > 0} />
        )}
      </div>

      {/* Il pascolo */}
      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">Il pascolo</h2>
        <PascoloVisivo {...visibili} calamita={stato.calamita} />
        <p className="mt-2 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
          <span>
            <Pallino colore={COLORI.falchi} /> falco
          </span>
          <span>
            <Pallino colore={COLORI.colombe} /> colomba
          </span>
          <span>
            <Pallino morto /> ucciso dalla calamità
          </span>
        </p>
      </section>

      {/* Grafico */}
      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">Come cambia la popolazione</h2>
        <GraficoQuote storico={stato.storico} />
      </section>

      {/* Ritorno all'equilibrio */}
      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">Ritorno all’equilibrio</h2>
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
          Per ogni calamità: dopo quante generazioni i falchi sono tornati a {EQ_FALCHI} ±{' '}
          {SOGLIA_RIENTRO}.
        </p>
        {ritorni.length === 0 ? (
          <p className="text-sm">Nessuna calamità finora.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                <th className="py-1 pr-2">Generazione</th>
                <th className="py-1 pr-2">Calamità</th>
                <th className="py-1 pr-2">Uccisi</th>
                <th className="py-1">Ritorno all’equilibrio</th>
              </tr>
            </thead>
            <tbody>
              {ritorni.map((r) => (
                <tr key={r.generazione} className="border-b border-gray-200 dark:border-gray-800">
                  <td className="py-1 pr-2 tabular-nums">{r.generazione}</td>
                  <td className="py-1 pr-2">
                    {CALAMITA[r.tipo].icona} {CALAMITA[r.tipo].nome}
                  </td>
                  <td className="py-1 pr-2 tabular-nums">
                    {Math.round(r.morti)} {CALAMITA[r.tipo].colpisce}
                  </td>
                  <td className="py-1">
                    {r.esito === 'rientrato' && (
                      <strong>
                        dopo {r.durata} generazioni (alla {r.rientro}ª)
                      </strong>
                    )}
                    {r.esito === 'in corso' && 'in corso…'}
                    {r.esito === 'interrotto' && 'interrotto da un’altra calamità'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Cosa osservare */}
      <details
        open
        className="mb-4 rounded-lg border-2 border-blue-500 bg-blue-50 p-3 text-sm dark:bg-blue-950"
      >
        <summary className="cursor-pointer font-semibold">Cosa osservare</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>
            Si parte con pochi falchi ({pct(stato.storico[0].falchi / K)}): in una ventina di
            generazioni si arriva vicino a {EQ_FALCHI} falchi e {K - EQ_FALCHI} colombe, l’
            <strong>equilibrio</strong>.
          </li>
          <li>
            Poi arrivano le calamità, ora da una parte ora dall’altra: {CALAMITA.epidemia.icona}{' '}
            un’epidemia uccide metà dei falchi, {CALAMITA.predatore.icona} un predatore metà delle
            colombe.
          </li>
          <li>
            Dopo ogni calamità guarda il grafico e la tabella «Ritorno all’equilibrio»: la
            popolazione <strong>ci ritorna da sola</strong>, in poche generazioni.
          </li>
          <li>
            Dalla generazione {ULTIMA_CALAMITA + 1} non succede più nulla e alla {GENERAZIONI}ª la
            popolazione è praticamente all’equilibrio.
          </li>
        </ol>
      </details>

      {/* Regole */}
      <section
        aria-labelledby="regole"
        className="mb-4 rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-700"
      >
        <h2 id="regole" className="mb-2 font-semibold">
          Le regole: falchi e colombe
        </h2>
        <div>
          <p>
            <strong style={{ color: COLORI.falchi }}>I falchi</strong> combattono sempre per il
            cibo; <strong style={{ color: COLORI.colombe }}>le colombe</strong> minacciano soltanto
            e, se attaccate, fuggono. A ogni incontro c’è in palio cibo che vale{' '}
            <strong>V = {V} punti</strong>; chi perde uno scontro fra falchi si ferisce e perde{' '}
            <strong>C = {C} punti</strong>. Più punti si accumulano, più figli si hanno: è la{' '}
            <Termine id="fitness">fitness</Termine>.
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <Incontro
              icone="🦅 🦅"
              titolo="Falco contro falco"
              esito={`Combattono: uno vince il cibo (+${V}), l’altro si ferisce (−${C}). In media ciascuno ottiene (${V} − ${C}) / 2 = −${(C - V) / 2} punti.`}
            />
            <Incontro
              icone="🦅 🕊️"
              titolo="Falco contro colomba"
              esito={`La colomba fugge senza ferirsi: il falco prende tutto (+${V}), la colomba resta a 0.`}
            />
            <Incontro
              icone="🕊️ 🕊️"
              titolo="Colomba contro colomba"
              esito={`Nessuna attacca: si dividono il cibo, ${V / 2} punti a testa.`}
            />
            <Incontro
              icone="⚖️"
              titolo="Perché nessuno vince del tutto"
              esito={`La ferita costa più del cibo (C > V). Se i falchi sono troppi si feriscono fra loro e le colombe stanno meglio; se sono pochi incontrano quasi solo colombe e prosperano.`}
            />
          </div>
        </div>
      </section>

      {/* Condizioni */}
      <details className="mb-4 rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-700">
        <summary className="cursor-pointer font-semibold">Condizioni dell’esperimento</summary>
        <p className="mb-1 mt-2 text-gray-600 dark:text-gray-400">
          Sono scelte del modello, fatte perché il ritorno all’equilibrio si veda chiaramente.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Modello deterministico.</strong> Si segue la quota di falchi come numero reale;
            i {K} pallini sono il valore arrotondato. Il caso decide solo quando arrivano le
            calamità e quali.
          </li>
          <li>
            <strong>Valori fissi:</strong> V = {V}, C = {C}; si parte con il{' '}
            {pct(stato.storico[0].falchi / K)} di falchi; {GENERAZIONI} generazioni.
          </li>
          <li>
            <strong>Calamità distanziate:</strong> solo dalla {PRIMA_CALAMITA}ª alla{' '}
            {ULTIMA_CALAMITA}ª generazione (prima la popolazione deve raggiungere l’equilibrio, dopo
            deve avere il tempo di tornarci), al massimo {MAX_CALAMITA}, a distanza di almeno{' '}
            {TREGUA} generazioni, alternate fra falchi e colombe. Ognuna uccide esattamente metà
            degli individui colpiti.
          </li>
          <li>
            <strong>Cosa vuol dire «all’equilibrio».</strong> Nella tabella, falchi a {EQ_FALCHI} ±{' '}
            {SOGLIA_RIENTRO} individui. L’equilibrio esatto (quota V/C) si raggiunge solo al limite:
            alla {GENERAZIONI}ª la distanza è meno di mezzo individuo, per cui i pallini mostrano{' '}
            {EQ_FALCHI} e {K - EQ_FALCHI}; il valore esatto è nel riepilogo finale.
          </li>
          <li>
            Con calamità più frequenti o ravvicinate il ritorno può essere interrotto prima di
            completarsi. Nel Modello casuale vedrai invece come le fluttuazioni casuali disturbano
            l’equilibrio.
          </li>
        </ul>
      </details>

      <p className="rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-700">
        Cosa succede quando entra in gioco il caso, e con strategie più furbe? Prova il{' '}
        <Link href="/casuale" className="font-semibold underline">
          Modello casuale
        </Link>
        . Perché esiste proprio questo equilibrio e perché è stabile? Teoria dei giochi,{' '}
        <Termine id="nash">equilibrio di Nash</Termine>,{' '}
        <Termine id="ess">strategie evolutivamente stabili</Termine> e i calcoli usati dalla
        simulazione sono negli{' '}
        <Link href="/approfondimenti" className="font-semibold underline">
          Approfondimenti
        </Link>
        .
      </p>
    </main>
  );
}

function Riepilogo({ stato, visibili, ritorni }) {
  const rientrati = ritorni.filter((r) => r.esito === 'rientrato');
  const media = rientrati.length
    ? rientrati.reduce((s, r) => s + r.durata, 0) / rientrati.length
    : null;
  const distanza = Math.abs(stato.falchi - QUOTA_FALCHI_EQUILIBRIO * K);
  return (
    <div
      role="status"
      className="mb-4 rounded-xl border-2 border-green-600 bg-green-50 p-4 text-green-950 dark:bg-green-950 dark:text-green-100"
    >
      <p>
        <strong>Fine: generazione {GENERAZIONI}.</strong> Falchi {visibili.falchi}, colombe{' '}
        {visibili.colombe}.{' '}
        {distanza < 0.5 ? (
          <>
            La distanza dall’equilibrio teorico ({EQ_FALCHI} e {K - EQ_FALCHI}) è di{' '}
            {distanza.toLocaleString('it-IT', { maximumSignificantDigits: 2 })} individui: meno di
            mezzo, quindi arrotondando si vede l’equilibrio.
          </>
        ) : (
          <>
            La popolazione è ancora a{' '}
            {distanza.toLocaleString('it-IT', { maximumFractionDigits: 1 })} individui
            dall’equilibrio teorico ({EQ_FALCHI} e {K - EQ_FALCHI}).
          </>
        )}
      </p>
      {ritorni.length > 0 && (
        <p className="mt-1">
          Calamità subite: {ritorni.length}.{' '}
          {rientrati.length === ritorni.length
            ? 'Dopo ognuna'
            : `Dopo ${rientrati.length} di queste`}{' '}
          la popolazione è tornata entro {SOGLIA_RIENTRO} individui dall’equilibrio
          {media !== null && (
            <>
              {' '}
              in media in{' '}
              <strong>
                {media.toLocaleString('it-IT', { maximumFractionDigits: 1 })} generazioni
              </strong>
            </>
          )}
          .
        </p>
      )}
      <p className="mt-1 text-xs">
        Valori esatti del calcolo: falchi{' '}
        {stato.falchi.toLocaleString('it-IT', {
          minimumFractionDigits: 6,
          maximumFractionDigits: 6,
        })}
        , colombe{' '}
        {stato.colombe.toLocaleString('it-IT', {
          minimumFractionDigits: 6,
          maximumFractionDigits: 6,
        })}
        .
      </p>
    </div>
  );
}

function Numero({ titolo, valore, nota, colore }) {
  return (
    <div className="rounded-lg border border-gray-300 p-3 dark:border-gray-700">
      <div className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">
        {titolo}
      </div>
      <div
        className="text-3xl font-bold tabular-nums"
        style={colore ? { color: colore } : undefined}
      >
        {valore}
      </div>
      {nota && (
        <div className="text-sm font-semibold" style={colore ? { color: colore } : undefined}>
          {nota}
        </div>
      )}
    </div>
  );
}

// Fascia compatta ad altezza fissa (una sola riga): l'avviso non sposta mai pascolo e grafico
function AvvisoCalamita({ calamita, generazione }) {
  const info = CALAMITA[calamita.tipo];
  return (
    <div
      role="alert"
      title={info.spiegazione}
      className="flex h-full items-center gap-2 overflow-hidden rounded-lg border-2 border-amber-500 bg-amber-50 px-3 font-bold text-amber-950 dark:bg-amber-950 dark:text-amber-100"
    >
      <span className="text-2xl leading-none" aria-hidden="true">
        {info.icona}
      </span>
      {/* Il numero degli individui colpiti non viene mai tagliato: se manca spazio si accorcia solo l'inizio */}
      <span className="min-w-0 truncate text-sm sm:text-base">
        {info.nome}! <span className="sm:hidden">Gen.</span>
        <span className="hidden sm:inline">Generazione</span> {generazione}:
      </span>
      <span className="shrink-0 whitespace-nowrap text-sm sm:text-base">
        {info.colpisce === 'falchi' ? 'muoiono' : 'catturate'} {Math.round(calamita.morti)}{' '}
        {info.colpisce}
      </span>
    </div>
  );
}

// Quando non c'è una calamità la stessa fascia dice, in breve, a che punto è il periodo delle calamità
function StatoCalamita({ generazione, finita, attive }) {
  let testo;
  if (finita) testo = 'Simulazione conclusa';
  else if (!attive) testo = 'Calamità disattivate';
  else if (generazione < PRIMA_CALAMITA - 1)
    testo = `Calamità dalla ${PRIMA_CALAMITA}ª generazione`;
  else if (generazione < ULTIMA_CALAMITA) testo = 'Nessuna calamità';
  else testo = 'Calamità finite';
  return (
    <div className="flex h-full items-center gap-2 overflow-hidden rounded-lg border border-dashed border-gray-300 px-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
      <span className="text-lg leading-none opacity-60" aria-hidden="true">
        🌿
      </span>
      <span className="truncate">{testo}</span>
    </div>
  );
}

function Pallino({ colore, morto }) {
  return (
    <span
      className="mr-1 inline-flex h-3 w-3 items-center justify-center rounded-full align-middle text-[8px] leading-none text-white"
      style={{ background: morto ? '#9ca3af' : colore }}
    >
      {morto ? '✕' : ''}
    </span>
  );
}

// Un pallino per individuo: falchi, colombe e, dopo una calamità, gli uccisi in grigio
function PascoloVisivo({ falchi, colombe, morti, calamita }) {
  const mortiFalchi = calamita && CALAMITA[calamita.tipo].colpisce === 'falchi' ? morti : 0;
  const mortiColombe = calamita && CALAMITA[calamita.tipo].colpisce === 'colombe' ? morti : 0;
  const celle = [
    ...Array(falchi).fill('falco'),
    ...Array(mortiFalchi).fill('morto'),
    ...Array(colombe).fill('colomba'),
    ...Array(mortiColombe).fill('morto'),
  ];
  return (
    <div
      className="grid gap-0.5 rounded-lg border border-gray-300 bg-green-50 p-2 dark:border-gray-700 dark:bg-green-950"
      style={{ gridTemplateColumns: 'repeat(40, minmax(0, 1fr))' }}
      role="img"
      aria-label={`${falchi} falchi e ${colombe} colombe${calamita ? `, ${morti} uccisi` : ''}`}
    >
      {celle.map((tipo, i) => (
        <span
          key={i}
          className={`flex aspect-square items-center justify-center rounded-full text-[6px] font-bold leading-none text-white transition-colors duration-500 ${tipo === 'morto' ? 'scale-90' : ''}`}
          style={{
            background:
              tipo === 'falco' ? COLORI.falchi : tipo === 'colomba' ? COLORI.colombe : '#9ca3af',
          }}
        >
          {tipo === 'morto' ? '✕' : ''}
        </span>
      ))}
    </div>
  );
}

function Incontro({ titolo, esito, icone }) {
  return (
    <div className="rounded border border-gray-200 p-2 dark:border-gray-700">
      <div className="flex items-center gap-2 font-semibold">
        {icone && (
          <span className="text-2xl leading-none" aria-hidden="true">
            {icone}
          </span>
        )}
        {titolo}
      </div>
      <div className="text-gray-700 dark:text-gray-300">{esito}</div>
    </div>
  );
}
