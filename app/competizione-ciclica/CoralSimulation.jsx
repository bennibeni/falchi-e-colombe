'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SIZE = 60;
const PIXELS = 480;
const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];
const SPECIES = [
  { name: 'Fondale libero', color: '#182b3c' },
  { name: 'Rapido', color: '#ff686b' },
  { name: 'Urticante', color: '#35a9e5' },
  { name: 'Spugna', color: '#31cc78' },
];
// Guadagno della specie sulla riga contro quella sulla colonna.
const PAYOFF = [
  [0, -1, 1],
  [1, 0, -1],
  [-1, 1, 0],
];
const panel = { background: '#102337', border: '1px solid #294257', borderRadius: 16, padding: 18 };
const button = {
  border: '1px solid #45617a',
  borderRadius: 9,
  padding: '9px 14px',
  background: '#203b52',
  color: '#edf5ff',
  cursor: 'pointer',
};

function createGrid(mode) {
  return Array.from({ length: SIZE * SIZE }, (_, i) => {
    const column = i % SIZE;
    const row = Math.floor(i / SIZE);
    if (mode === 'vertical') return 1 + Math.floor((column * 3) / SIZE);
    if (mode === 'horizontal') return 1 + Math.floor((row * 3) / SIZE);
    if (mode === 'sectors') {
      const angle = Math.atan2(row - (SIZE - 1) / 2, column - (SIZE - 1) / 2) + Math.PI;
      return 1 + Math.min(2, Math.floor(angle / ((2 * Math.PI) / 3)));
    }
    if (mode === 'rings') {
      const radius = Math.hypot(column - (SIZE - 1) / 2, row - (SIZE - 1) / 2);
      return 1 + (Math.floor(radius / 6) % 3);
    }
    if (mode === 'spirals') {
      // A winding phase seeds broad spiral arms; subsequent motion is local.
      const x = (i % SIZE) - SIZE * 0.43;
      const y = Math.floor(i / SIZE) - SIZE * 0.46;
      const phase = Math.atan2(y, x) + Math.hypot(x, y) * ((2 * Math.PI) / 19);
      const wrapped = ((phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      return 1 + Math.floor(wrapped / ((2 * Math.PI) / 3));
    }
    if (mode === 'islands') {
      const x = i % SIZE;
      const y = Math.floor(i / SIZE);
      const centers = [
        [17, 18],
        [43, 18],
        [30, 42],
      ];
      return centers.findIndex(([cx, cy]) => Math.hypot(x - cx, y - cy) < 9) + 1;
    }
    return Math.random() < 0.7 ? 1 + Math.floor(Math.random() * 3) : 0;
  });
}

export default function CoralSimulation() {
  const canvasRef = useRef(null);
  const gridRef = useRef([]);
  const tickRef = useRef(0);
  const settings = useRef({ running: true, speed: 12 });
  const painting = useRef(false);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(12);
  const [mode, setMode] = useState('spirals');
  const [stats, setStats] = useState({ tick: 0, counts: [3600, 0, 0, 0] });
  const [history, setHistory] = useState([]);

  const render = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !gridRef.current.length) return;
    gridRef.current.forEach((type, i) => {
      ctx.fillStyle = SPECIES[type].color;
      ctx.fillRect((i % SIZE) * 8, Math.floor(i / SIZE) * 8, 8, 8);
      ctx.fillStyle = 'rgba(9, 24, 39, 0.16)';
      ctx.fillRect((i % SIZE) * 8, Math.floor(i / SIZE) * 8, 8, 0.6);
      ctx.fillRect((i % SIZE) * 8, Math.floor(i / SIZE) * 8, 0.6, 8);
    });
  }, []);

  const sample = useCallback((reset = false) => {
    const counts = [0, 0, 0, 0];
    gridRef.current.forEach((type) => counts[type]++);
    const point = { tick: tickRef.current, counts };
    setStats(point);
    setHistory((previous) =>
      reset ? [point] : [...previous.filter((p) => p.tick !== point.tick).slice(-119), point],
    );
  }, []);

  const reset = useCallback(
    (preset) => {
      gridRef.current = createGrid(preset);
      tickRef.current = 0;
      render();
      sample(true);
    },
    [render, sample],
  );

  const step = useCallback(() => {
    const grid = gridRef.current;
    if (!grid.length) return;
    const next = grid.slice();
    for (let i = 0; i < grid.length; i++) {
      const type = grid[i];
      const counts = [0, 0, 0, 0];
      for (const [dy, dx] of DIRECTIONS) {
        const neighbor =
          grid[
            ((Math.floor(i / SIZE) + dy + SIZE) % SIZE) * SIZE + (((i % SIZE) + dx + SIZE) % SIZE)
          ];
        counts[neighbor]++;
      }
      // Synchronous cyclic invasion: a front advances with support from 3 neighbors.
      if (type) {
        const predator = (type % 3) + 1;
        if (counts[predator] >= 3) next[i] = predator;
      } else {
        const candidates = [1, 2, 3].filter((t) => counts[t] >= 3);
        if (candidates.length) next[i] = candidates[Math.floor(Math.random() * candidates.length)];
      }
    }
    gridRef.current = next;
    tickRef.current++;
    render();
    sample();
  }, [render, sample]);

  useEffect(() => {
    let frame;
    let last = null;
    let elapsed = 0;
    const loop = (time) => {
      if (!gridRef.current.length) reset('spirals');
      const delta = last === null ? 0 : Math.min(time - last, 100);
      last = time;
      if (settings.current.running) {
        elapsed += delta;
        const interval = 1000 / settings.current.speed;
        if (elapsed >= interval) {
          elapsed %= interval;
          step();
        }
      } else elapsed = 0;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [reset, step]);

  const perturb = (x, y) => {
    if (!gridRef.current.length) return;
    for (let dy = -3; dy <= 3; dy++)
      for (let dx = -3; dx <= 3; dx++) {
        if (dx * dx + dy * dy > 9) continue;
        const index = ((y + dy + SIZE) % SIZE) * SIZE + ((x + dx + SIZE) % SIZE);
        gridRef.current[index] = (gridRef.current[index] % 3) + 1;
      }
    render();
    sample();
  };

  const disturbAtPointer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * SIZE);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * SIZE);
    if (x >= 0 && y >= 0 && x < SIZE && y < SIZE) perturb(x, y);
  };

  return (
    <section
      style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: 'clamp(12px, 3vw, 28px)',
        background: '#091827',
        color: '#edf5ff',
        borderRadius: 22,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <p style={{ color: '#7ce0cf', letterSpacing: 3, fontSize: 12, margin: 0 }}>
        LABORATORIO MARINO / 01
      </p>
      <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', margin: '8px 0' }}>
        Spirali di vita nel fondale
      </h2>
      <p style={{ color: '#adc4d8', lineHeight: 1.6 }}>
        Tre specie si inseguono in onde colorate. Le spirali partono da una disposizione preparata e
        si evolvono attraverso la competizione tra gli otto vicini.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 360px', minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 10,
              fontSize: 13,
              color: '#adc4d8',
            }}
          >
            <span>{running ? '● Ecosistema attivo' : 'Ⅱ In pausa'}</span>
            <span>Generazione {stats.tick}</span>
          </div>
          <canvas
            ref={canvasRef}
            width={PIXELS}
            height={PIXELS}
            aria-label="Fondale interattivo. Trascina per perturbare le onde, oppure premi Invio o Spazio per perturbare il centro."
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                perturb(Math.floor(SIZE / 2), Math.floor(SIZE / 2));
              }
            }}
            style={{
              display: 'block',
              width: '100%',
              aspectRatio: '1',
              borderRadius: 12,
              cursor: 'crosshair',
              touchAction: 'none',
              imageRendering: 'pixelated',
            }}
            onPointerDown={(event) => {
              painting.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              disturbAtPointer(event);
            }}
            onPointerMove={(event) => {
              if (painting.current) disturbAtPointer(event);
            }}
            onPointerUp={() => {
              painting.current = false;
            }}
            onPointerCancel={() => {
              painting.current = false;
            }}
            onLostPointerCapture={() => {
              painting.current = false;
            }}
          />
          <p style={{ color: '#adc4d8', fontSize: 13 }}>
            Trascina per perturbare le onde; da tastiera usa Invio o Spazio sul fondale. I bordi
            sono collegati.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button
              type="button"
              style={{ ...button, background: '#176b62' }}
              onClick={() => {
                settings.current.running = !running;
                setRunning(!running);
              }}
            >
              {running ? 'Pausa' : 'Riprendi'}
            </button>
            <button
              type="button"
              style={{ ...button, opacity: running ? 0.5 : 1 }}
              disabled={running}
              onClick={step}
            >
              Un passo
            </button>
            <button type="button" style={button} onClick={() => reset(mode)}>
              Ricomincia
            </button>
          </div>
        </div>
        <aside style={{ flex: '1 1 260px', minWidth: 0, display: 'grid', gap: 14 }}>
          <div style={panel}>
            <h3 style={{ margin: '0 0 14px' }}>Popolazioni</h3>
            {[1, 2, 3, 0].map((type) => (
              <div key={type} style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span>{SPECIES[type].name}</span>
                  <strong>{(stats.counts[type] / 36).toFixed(1)}%</strong>
                </div>
                <div style={{ height: 5, background: '#304357', borderRadius: 5, marginTop: 6 }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${stats.counts[type] / 36}%`,
                      background: SPECIES[type].color,
                      borderRadius: 5,
                    }}
                  />
                </div>
              </div>
            ))}
            <p style={{ color: '#adc4d8', fontSize: 12, marginBottom: 0 }}>
              Rapido → Spugna → Urticante → Rapido
              <br />
              Ogni specie sostituisce quella indicata dalla freccia.
            </p>
          </div>
          <div style={{ ...panel, display: 'grid', gap: 16 }}>
            <label>
              Velocità · {speed} passi/s
              <input
                aria-label="Velocità"
                type="range"
                min="1"
                max="30"
                value={speed}
                style={{ display: 'block', width: '100%', accentColor: '#7ce0cf' }}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  settings.current.speed = value;
                  setSpeed(value);
                }}
              />
            </label>
            <label>
              Scenario iniziale{' '}
              <select
                style={{ ...button, width: '100%', marginTop: 6 }}
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value);
                  reset(e.target.value);
                }}
              >
                <option value="spirals">Spirali (principale)</option>
                <option value="vertical">Tre bande verticali</option>
                <option value="horizontal">Tre bande orizzontali</option>
                <option value="sectors">Tre settori a ventaglio</option>
                <option value="rings">Anelli concentrici</option>
                <option value="random">Mosaico casuale</option>
                <option value="islands">Tre isole separate</option>
              </select>
            </label>
          </div>
        </aside>
      </div>
      <div style={{ ...panel, marginTop: 20 }}>
        <h3 style={{ margin: 0 }}>Il ritmo della barriera</h3>
        <p style={{ color: '#adc4d8', fontSize: 13 }}>
          Quota tra le celle occupate · ultime 120 generazioni · scala 0–100%
        </p>
        <svg
          viewBox="0 0 720 140"
          role="img"
          aria-label="Quote tra le celle occupate: rapido rosso, urticante blu, spugna verde. Linea tratteggiata al 33,3%, riferimento di Nash del gioco classico."
          style={{ display: 'block', width: '100%' }}
        >
          {[10, 65, 120].map((y) => (
            <line key={y} x1="32" x2="710" y1={y} y2={y} stroke="#304357" strokeDasharray="4 5" />
          ))}
          <text x="0" y="14" fill="#adc4d8" fontSize="10">
            100
          </text>
          <text x="12" y="124" fill="#adc4d8" fontSize="10">
            0
          </text>
          <line
            x1="32"
            x2="710"
            y1={120 - 110 / 3}
            y2={120 - 110 / 3}
            stroke="#7ce0cf"
            strokeWidth="1.5"
            strokeDasharray="7 5"
          />
          <text x="704" y={114 - 110 / 3} textAnchor="end" fill="#7ce0cf" fontSize="11">
            Nash · 33,3%
          </text>
          {[1, 2, 3].map((type) => (
            <path
              key={type}
              fill="none"
              stroke={SPECIES[type].color}
              strokeWidth="2.5"
              strokeLinejoin="round"
              d={history
                .map((p, i) => {
                  const occupied = p.counts[1] + p.counts[2] + p.counts[3];
                  if (!occupied) return '';
                  const previous = history[i - 1];
                  const command =
                    !previous || previous.counts[1] + previous.counts[2] + previous.counts[3] === 0
                      ? 'M'
                      : 'L';
                  return (
                    command +
                    (32 + (i / Math.max(history.length - 1, 1)) * 678) +
                    ',' +
                    (120 - (p.counts[type] / occupied) * 110)
                  );
                })
                .join(' ')}
            />
          ))}
        </svg>
        <p style={{ color: '#adc4d8', fontSize: 13 }}>
          Il grafico esclude il fondale libero: tre specie ugualmente presenti valgono ciascuna
          33,3% delle celle occupate. Le barre sopra mostrano invece la quota dell’intero fondale.
          Senza celle occupate, le quote non sono definite e il grafico non mostra valori.
        </p>
        <p style={{ color: '#adc4d8', fontSize: 12, marginBottom: 0 }}>
          Esperimento: scegli le tre bande verticali e osserva come attraversano i bordi collegati.
          Trascina per rompere la simmetria e confrontare i nuovi fronti. Modello illustrativo di
          competizione ciclica, non una previsione ecologica.
        </p>
      </div>
      <div style={{ ...panel, marginTop: 20 }}>
        <h3 style={{ margin: '0 0 12px' }}>Il legame con l’equilibrio di Nash</h3>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: 14 }}
          >
            <caption style={{ textAlign: 'left', color: '#adc4d8', paddingBottom: 12 }}>
              Matrice del gioco classico: guadagno della riga contro la colonna. +1 = vince, −1 =
              perde, 0 = pareggio.
            </caption>
            <thead>
              <tr>
                <th scope="col" style={{ padding: 10 }}>
                  Riga / Colonna
                </th>
                {SPECIES.slice(1).map((species) => (
                  <th key={species.name} scope="col" style={{ padding: 10, color: species.color }}>
                    {species.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PAYOFF.map((row, i) => (
                <tr key={i}>
                  <th
                    scope="row"
                    style={{
                      padding: 10,
                      borderTop: '1px solid #294257',
                      color: SPECIES[i + 1].color,
                    }}
                  >
                    {SPECIES[i + 1].name}
                  </th>
                  {row.map((value, j) => (
                    <td key={j} style={{ padding: 10, borderTop: '1px solid #294257' }}>
                      {value > 0 ? '+1' : value < 0 ? '−1' : '0'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ lineHeight: 1.7 }}>
          <strong>Equilibrio misto: 1/3 Rapido, 1/3 Urticante, 1/3 Spugna.</strong> Nel gioco
          classico, se l’avversario sceglie così, ogni strategia ha guadagno atteso zero. Nessun
          giocatore può migliorare il proprio guadagno cambiando strategia da solo.
        </p>
        <p style={{ color: '#adc4d8', lineHeight: 1.7, marginBottom: 0 }}>
          La linea al 33,3% è un riferimento teorico: raggiungerla non dimostra un equilibrio di
          Nash nella barriera. Qui gli incontri dipendono dai vicini e dalla disposizione delle
          colonie; le celle libere possono essere colonizzate. La matrice descrive la competizione;
          i guadagni non sono usati come tassi di crescita. Il modello può oscillare e non è
          obbligato a convergere. L’equilibrio misto del gioco classico a somma zero non è una
          strategia evolutivamente stabile (ESS).
        </p>
      </div>
    </section>
  );
}
