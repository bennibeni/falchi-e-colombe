# Falchi, colombe e calamità

App didattica autonoma in italiano, costruita con Next.js, React, Tailwind CSS e
Recharts.

## Avvio

Richiede Node.js 20.9 o successivo e npm.

```powershell
npm install
npm run dev
```

Apri http://localhost:3000. Se la porta è occupata:
`npm run dev -- --port 3010`.

## Pagine

- `/`: simulazione deterministica con calamità e ritorno all'equilibrio.
- `/casuale`: popolazioni casuali con falchi, colombe, borghesi e ritorsori.
- `/approfondimenti`: teoria, formule e glossario.

Tutte le immagini sono incluse nel progetto. Non servono chiavi API o servizi
esterni.

## Comandi

- `npm test`: test dei motori delle simulazioni.
- `npm run lint`: controlli del codice.
- `npm run build`: build di produzione.
- `npm start`: avvio della build di produzione.
- `npm run format`: formattazione.

Il progetto può essere importato in Vercel come app Next.js.

## Struttura

`app/` contiene pagine, componenti, motori, test e immagini. `app/casuale/`
contiene il modello stocastico. `app/approfondimenti/` contiene la pagina
teorica.

## Modelli

Il modello deterministico usa V = 50, C = 100 e 200 individui visualizzati.
Calcola quote reali e arrotonda solo per la visualizzazione. Le calamità sono
distanziate e limitate alle generazioni 20–75. Il rientro è misurato entro due
individui dall'equilibrio teorico.

Il modello casuale usa 1000 individui, incontri casuali e riproduzione per
campionamento, senza mutazioni né calamità. Comprende tre scenari e un parametro
per l'ambiguità dei ruoli nello scenario con i borghesi.
