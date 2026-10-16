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
        <footer className="projects-footer">
          <a href="https://links-page-bennibeni.vercel.app/">&larr; All projects</a>
        </footer>
      </body>
    </html>
  );
}
