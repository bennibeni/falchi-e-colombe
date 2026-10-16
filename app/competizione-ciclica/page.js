import MenuNavigazione from '../MenuNavigazione';
import CoralSimulation from './CoralSimulation';

export const metadata = {
  title: 'Competizione ciclica — Spirali coralline',
  description:
    'Spirali coralline, equilibrio di Nash e stabilità evolutiva: un laboratorio di competizione spaziale tra tre strategie.',
};

const card = {
  padding: 'clamp(16px, 3vw, 24px)',
  border: '1px solid #cbd5e1',
  borderRadius: 14,
  background: '#f8fafc',
  color: '#172b40',
  lineHeight: 1.75,
  marginBottom: 24,
};

export default function Page() {
  return (
    <div
      style={{
        maxWidth: 1056,
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <MenuNavigazione attiva="competizione-ciclica" />
      <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', marginBottom: 12 }}>
        Competizione ciclica — Spirali coralline
      </h1>
      <p style={{ lineHeight: 1.75, marginBottom: 24 }}>
        Dopo Falchi e Colombe, esploriamo un ecosistema con tre strategie. Nessuna prevale su tutte:
        ciascuna ha un vantaggio su una e una debolezza verso l’altra. Cosa cambia quando gli
        incontri avvengono tra vicini?
      </p>
      <section aria-labelledby="confronto-modelli" style={card}>
        <h2 id="confronto-modelli" style={{ marginTop: 0 }}>
          Due forme diverse di competizione
        </h2>
        <p>
          Nel gioco classico <strong>Falchi e Colombe</strong>, se il costo dello scontro C supera
          il valore della risorsa V (0 &lt; V &lt; C), l’equilibrio misto assegna probabilità V/C al
          Falco e 1 − V/C alla Colomba. È una strategia evolutivamente stabile nel modello teorico
          standard. Con V = 50 e C = 100, la quota teorica dei Falchi è il 50%. Una popolazione
          finita simulata può comunque oscillare o perdere una strategia.
        </p>
        <p>
          Qui la competizione segue invece il ciclo{' '}
          <strong>Rapido batte Spugna, Spugna batte Urticante, Urticante batte Rapido</strong>. È la
          struttura di sasso–carta–forbice. Le onde permettono di esplorare coesistenza e
          oscillazioni nello spazio: non sono una dimostrazione di stabilità evolutiva.
        </p>
      </section>
      <section aria-labelledby="regole-coralli" style={card}>
        <h2 id="regole-coralli" style={{ marginTop: 0 }}>
          Che cosa stai osservando
        </h2>
        <ul style={{ paddingLeft: 22 }}>
          <li>
            <strong>Spirali inizializzate artificialmente.</strong> Lo scenario principale parte da
            una disposizione geometrica preparata. Le spirali iniziali non emergono da una griglia
            casuale; dopo l’avvio, il disegno evolve attraverso le interazioni locali.
          </li>
          <li>
            <strong>Regole locali.</strong> Ogni cella considera gli otto vicini e passa alla specie
            che la batte quando il numero di vicini di quella specie raggiunge la soglia di
            conquista: da 1 a 8, inizialmente 3. Tutte le celle vengono aggiornate insieme.
          </li>
          <li>
            <strong>Bordi collegati.</strong> Il fondale è una griglia toroidale: ciò che attraversa
            un bordo rientra dal lato opposto. Questo evita pareti, ma non garantisce onde perpetue.
          </li>
          <li>
            <strong>Spazio libero.</strong> Una cella vuota viene colonizzata da una specie presente
            in almeno tre vicini; se ce ne sono più di una, la scelta è casuale. Non ci sono
            mortalità o reintroduzioni spontanee. Trascinare cambia localmente le specie e perturba
            il sistema.
          </li>
          <li>
            <strong>Modello illustrativo.</strong> Una simulazione interattiva in tempo reale basata su un{' '}
            <strong>Automa Cellulare</strong> (simile al{' '}
            <a href="https://it.wikipedia.org/wiki/Gioco_della_vita" target="_blank" rel="noopener noreferrer" className="marine-reference-link">
              Gioco della Vita di Conway
            </a>, ma con regole diverse).
            I nomi dei coralli rappresentano strategie
            astratte. Non è una previsione ecologica, né la dinamica del replicatore del gioco
            classico. I guadagni della matrice non vengono usati come tassi di crescita.
          </li>
        </ul>
      </section>
      <CoralSimulation />
      <section aria-labelledby="nash-ess" style={{ ...card, marginTop: 24 }}>
        <h2 id="nash-ess" style={{ marginTop: 0 }}>
          Perché Nash non significa ESS
        </h2>
        <p>
          Nel sasso–carta–forbice classico, con vittoria +1, sconfitta −1 e pareggio 0, l’equilibrio
          di Nash è la miscela <strong>(1/3, 1/3, 1/3)</strong>. Contro questa miscela ogni scelta
          ha guadagno atteso zero: (+1)/3 + (−1)/3 + 0/3 = 0. Cambiare strategia da soli non
          migliora il guadagno.
        </p>
        <p>
          Una <strong>strategia evolutivamente stabile (ESS)</strong> richiede di più: quando arriva
          una piccola minoranza con una strategia diversa, i residenti devono ottenere un rendimento
          strettamente superiore agli invasori. Immagina residenti che usano la miscela uniforme e
          invasori che scelgono sempre Rapido. Tutti gli incontri hanno guadagno atteso zero:
          residenti contro residenti, invasori contro residenti, residenti contro invasori e
          invasori tra loro. Nessun vantaggio selettivo elimina la minoranza. Questo basta a
          escludere l’ESS, anche se gli invasori non hanno un vantaggio.
        </p>
        <p>
          La quota del 33,3% nel grafico è quindi un <strong>riferimento del gioco classico</strong>
          , calcolato qui tra le celle occupate. Raggiungerla non prova che la barriera sia in
          equilibrio di Nash o che torni alle stesse proporzioni dopo una perturbazione: la
          disposizione delle colonie conta quanto le loro frequenze.
        </p>
        <p style={{ marginBottom: 0 }}>
          Equilibrio di Nash, stabilità evolutiva e formazione di strutture spaziali sono concetti
          collegati, ma distinti. Anche l’assenza di ESS non significa che ogni perturbazione faccia
          necessariamente crescere una specie invasora.
        </p>
      </section>
      <section aria-labelledby="esperimenti-coralli" style={card}>
        <h2 id="esperimenti-coralli" style={{ marginTop: 0 }}>
          Tre esperimenti da provare
        </h2>
        <ol style={{ paddingLeft: 22, marginBottom: 0 }}>
          <li>
            Scegli le tre bande verticali: ciascuna specie occupa un terzo del fondale. Osserva se
            il disegno si muove anche quando le percentuali restano uguali.
          </li>
          <li>
            Metti in pausa, perturba un confine trascinando e riprendi. Confronta l’evoluzione delle
            forme con quella delle popolazioni.
          </li>
          <li>
            Confronta spirali, anelli e mosaico casuale. Le stesse regole locali possono produrre
            evoluzioni diverse a partire da disposizioni diverse.
          </li>
        </ol>
      </section>
    </div>
  );
}
