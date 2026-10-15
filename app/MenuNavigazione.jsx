import Link from 'next/link';

const VOCI = [
  { id: 'simulazione', href: '/', testo: 'Simulazione' },
  { id: 'casuale', href: '/casuale', testo: 'Modello casuale' },
  { id: 'competizione-ciclica', href: '/competizione-ciclica', testo: 'Competizione ciclica' },
  { id: 'approfondimenti', href: '/approfondimenti', testo: 'Approfondimenti' },
];

export default function MenuNavigazione({ attiva }) {
  return (
    <nav aria-label="Navigazione della simulazione" className="mb-4 flex flex-wrap gap-2">
      {VOCI.map((v) => (
        <Link
          key={v.id}
          href={v.href}
          aria-current={v.id === attiva ? 'page' : undefined}
          className={`rounded border px-3 py-1.5 text-sm ${
            v.id === attiva
              ? 'border-gray-800 bg-gray-800 text-white dark:border-gray-200 dark:bg-gray-200 dark:text-gray-900'
              : 'border-gray-400 hover:bg-black/5 dark:hover:bg-white/10'
          }`}
        >
          {v.testo}
        </Link>
      ))}
    </nav>
  );
}
