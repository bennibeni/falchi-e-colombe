import './globals.css';

export const metadata = {
  title: { default: 'Falchi, colombe e calamità', template: '%s | Falchi e colombe' },
  description:
    'Esplora equilibrio evolutivo, calamità e strategie nel gioco Falco-Colomba con simulazioni interattive e approfondimenti.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>
        {children}
        <footer className="mx-auto max-w-4xl px-4 py-6 text-sm">
          <a
            href="https://links-page-bennibeni.vercel.app/"
            className="text-blue-600 underline dark:text-blue-400"
          >
            ← Tutti i progetti
          </a>
        </footer>
      </body>
    </html>
  );
}
