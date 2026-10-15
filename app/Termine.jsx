'use client';

import { useId, useRef, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import { GLOSSARIO } from './glossario';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

// Parola del testo seguita da un'icona «i» che apre una finestra con la spiegazione.
// La finestra è montata in document.body, così il componente si può usare anche dentro un <p>.
export default function Termine({ id, children }) {
  const voce = GLOSSARIO[id];
  const dialog = useRef(null);
  const titoloId = useId();
  const montato = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  if (!voce) throw new Error(`Voce di glossario sconosciuta: ${id}`);

  return (
    <>
      {children ?? voce.titolo}
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-label={`Che cos’è: ${voce.titolo}`}
        className="ml-0.5 inline-flex rounded-full p-0.5 align-text-top text-blue-600 hover:bg-blue-100 focus-visible:outline-2 dark:text-blue-400 dark:hover:bg-blue-900"
      >
        <Info size={14} aria-hidden="true" />
      </button>
      {montato &&
        createPortal(
          <dialog
            ref={dialog}
            aria-labelledby={titoloId}
            onClick={(e) => {
              if (e.target === e.currentTarget) dialog.current.close();
            }}
            className="fixed inset-0 m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border border-gray-300 bg-white p-0 text-left text-sm text-gray-900 shadow-xl backdrop:bg-black/50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <div className="p-5">
              <h2 id={titoloId} className="text-lg font-semibold">
                {voce.titolo}
              </h2>
              {voce.immagine && (
                <figure className="mt-3 text-center">
                  <Image
                    src={voce.immagine.src.src ?? voce.immagine.src}
                    alt={voce.immagine.alt}
                    width={voce.immagine.src.width}
                    height={voce.immagine.src.height}
                    className="mx-auto h-auto max-h-56 w-auto rounded"
                  />
                  {voce.immagine.didascalia && (
                    <figcaption className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {voce.immagine.didascalia}
                    </figcaption>
                  )}
                </figure>
              )}
              <div className="mt-3 space-y-2 leading-relaxed">
                {voce.paragrafi.map((t) => (
                  <p key={t}>{t}</p>
                ))}
                {voce.esempio && (
                  <p className="rounded bg-blue-50 p-2 dark:bg-blue-950">
                    <strong>Esempio. </strong>
                    {voce.esempio}
                  </p>
                )}
              </div>
              <form method="dialog" className="mt-4 text-right">
                <button
                  className="rounded border px-4 py-1.5 hover:bg-black/5 dark:hover:bg-white/10"
                  autoFocus
                >
                  Chiudi
                </button>
              </form>
            </div>
          </dialog>,
          document.body,
        )}
    </>
  );
}
