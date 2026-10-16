# Pagina «Il progetto»: note editoriali e fonti

Pagina pubblica: `/progetto/` (HTML statico in `progetto/index.html`). Il CSS dedicato è in `assets/css/project.css`, mantenuto separato da `assets/css/site.css` per evitare regressioni nelle altre pagine.

## Documenti da cui sono tratti i contenuti

- «Modello E — Scheda di presentazione del progetto»: titolo, obiettivi, durata, descrizione del metodo, cinque azioni, stime quantitative e monitoraggio.
- «Allegato tecnico — Piano operativo delle attività territoriali e contributo dei partner»: territori, ruolo del capofila e dei partner, attività dimostrative e finestre operative.
- «Raccolta formulari»: conferma dei 10 partner territoriali, 16 sostenitori e zone-distretto.

**Importante:** non caricare nel repository pubblico PDF con firme digitali, dati anagrafici, dati bancari, nominativi di referenti non destinati alla divulgazione o formulari interni completi.

## Organizzazione della pagina

1. Perché: bisogni e contesto.
2. Obiettivi: tre priorità di intervento.
3. Metodo: governance, rete territoriale, kit e misurazione.
4. Azioni: A1 governance, A2 attivazione, A3 cicli continuativi, A4 formazione, A5 restituzione.
5. Territori: 11 zone-distretto della Toscana.
6. Risultati: target della proposta, **non risultati conseguiti**.
7. Continuità: trasferibilità e modello replicabile.

## Rimodulazione temporale (ottobre 2026)

- Durata aggiornata del progetto: **15 mesi**, con inizio attività in **ottobre 2026** e fine del periodo progettuale in **31 dicembre 2027**.
- Le attività e i cicli previsti prima di ottobre 2026 oppure oltre dicembre 2027 non compaiono nella programmazione pubblica del progetto rimodulato.
- Nel dataset `content/events.json`, `scheduleBeforeRemodulation` mantiene le finestre precedenti per tracciabilità editoriale. Non pubblicare le vecchie finestre sulle schede eventi.
- Le date giornaliere non vengono automaticamente confermate o riprogrammate.

## Manutenzione

- Le cifre 60 appuntamenti, 5.000 presenze, almeno 10 momenti pubblici e 50 persone da formare/attivare sono **obiettivi progettuali stimati**, non consuntivi.
- Non convertire le finestre mensili dei piani tecnici in appuntamenti fissati senza conferma del partner; questi vanno nel file `content/events.json`.
- Le descrizioni delle attività programmate non certificano che siano già state realizzate.
- Per modifiche grafiche specifiche usare `assets/css/project.css`, evitando di sovrascrivere la grafica approvata della home e del calendario.
- Le fonti amministrative originali sono conservate esternamente al repository pubblico; qui rimane soltanto una rielaborazione per la comunicazione.
- La pagina conserva temporaneamente l'impostazione robots noindex presente nella prima versione. Revisionare l'indicizzazione quando il sito sarà pronto alla comunicazione pubblica generale.

## Verifiche tecniche effettuate

- Sette sezioni tematiche collegate da un indice interno.
- Cinque azioni A1–A5.
- ID delle sezioni unici e link interni risolti.
- CSS dedicato responsive.
