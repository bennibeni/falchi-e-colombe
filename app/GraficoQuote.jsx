'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CALAMITA,
  GENERAZIONI,
  PRIMA_CALAMITA,
  QUOTA_FALCHI_EQUILIBRIO,
  ULTIMA_CALAMITA,
} from './simulazione';

export const COLORI = {
  falchi: '#dc2626',
  colombe: '#2563eb',
  calamita: '#d97706',
  equilibrio: '#6b7280',
};

// Quote di falchi e colombe nel tempo; ogni calamità è una linea verticale arancione con la sua icona
export default function GraficoQuote({ storico }) {
  const dati = storico.map((p) => {
    const n = p.falchi + p.colombe || 1;
    return {
      generazione: p.generazione,
      falchi: (p.falchi / n) * 100,
      colombe: (p.colombe / n) * 100,
    };
  });
  const calamita = storico.filter((p) => p.calamita);
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dati} margin={{ top: 28, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.15} />
          <XAxis
            dataKey="generazione"
            type="number"
            domain={[0, GENERAZIONI]}
            ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
            allowDecimals={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} width={48} />
          <Tooltip
            formatter={(v, nome) => [`${Number(v).toFixed(0)}%`, nome]}
            labelFormatter={(g) => `Generazione ${g}`}
          />
          <Legend />
          <ReferenceLine
            y={QUOTA_FALCHI_EQUILIBRIO * 100}
            stroke={COLORI.equilibrio}
            strokeDasharray="6 4"
            label={{
              value: `equilibrio ${Math.round(QUOTA_FALCHI_EQUILIBRIO * 100)}%`,
              position: 'insideBottomRight',
              fontSize: 12,
            }}
          />
          <ReferenceArea
            x1={PRIMA_CALAMITA}
            x2={ULTIMA_CALAMITA}
            fill={COLORI.calamita}
            fillOpacity={0.07}
            label={{ value: 'periodo delle calamità', position: 'insideTop', fontSize: 11 }}
          />
          {calamita.map((p) => (
            <ReferenceLine
              key={p.generazione}
              x={p.generazione}
              stroke={COLORI.calamita}
              strokeWidth={3}
              strokeOpacity={0.6}
              label={{ value: CALAMITA[p.calamita].icona, position: 'top', fontSize: 18 }}
            />
          ))}
          <Line
            name="Falchi"
            dataKey="falchi"
            stroke={COLORI.falchi}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            name="Colombe"
            dataKey="colombe"
            stroke={COLORI.colombe}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
