# Gallery & Press — Manuale editoriale
Pagina pubblica: https://giocodisquadra.net/gallery-press/
Repository: `federludo/gioco-di-squadra`, ramo `main`.

## Architettura
- `gallery-press/index.html` — pagina editoriale permanente.
- `content/gallery-press.json` — **unica sorgente dati** per gallerie, comunicati, rassegna, press kit e KPI.
- `assets/js/gallery-press.js` — rendering, gallerie espandibili e lightbox accessibile.
- `assets/css/gallery-press.css` — design responsivo.
- `assets/images/gallery/<AAAA-MM-GG-slug>/full/` — versioni grandi WebP.
- `assets/images/gallery/<AAAA-MM-GG-slug>/thumb/` — miniature WebP, con identici nomi.
- `assets/images/gallery/press-kit/` — foto autorizzate per la stampa.
- `assets/documents/gallery-press/comunicati/` — testi originali dei comunicati in DOCX.
- `assets/documents/gallery-press/` — presentazioni, schede e altri documenti per la stampa.

## Caricamento iniziale
Lo ZIP dell'archivio iniziale è stato consegnato in chat con un registro dei nomi originali.
Non caricare lo ZIP direttamente nel repository. Estrarlo sul computer, poi caricare i file nella cartella GitHub corrispondente.
**Le sottocartelle esistono già**, con un file `.gitkeep` che puoi lasciare al suo posto.
La prima galleria ha 21 immagini e 21 miniature; la seconda 29 immagini e 29 miniature.
Altre tre immagini WebP sono dedicate al press kit.

## Aggiungere un nuovo evento
1. Crea lo slug `AAAA-MM-GG-titolo-breve` e due directory in `assets/images/gallery/<slug>/full` e `.../thumb`.
2. Per ogni foto prepara una versione ottimizzata WebP fino a ~1800px e una miniatura ~580px; usa gli stessi nomi in entrambe (es. `foto-01.webp`).
3. In `content/gallery-press.json` aggiungi un elemento in `events` con campi:
```json
{
  "id":"2027-03-20-una-giornata-di-gioco",
  "date":"2027-03-20",
  "dateLabel":"20 marzo 2027",
  "location":"Città (Provincia)",
  "venue":"Luogo documentato",
  "title":"Titolo dell’evento",
  "subtitle":"Sottotitolo facoltativo",
  "description":"Descrizione sintetica e verificabile.",
  "cover":"assets/images/gallery/2027-03-20-una-giornata-di-gioco/full/foto-01.webp",
  "photos":[{"full":"assets/images/gallery/2027-03-20-una-giornata-di-gioco/full/foto-01.webp","thumb":"assets/images/gallery/2027-03-20-una-giornata-di-gioco/thumb/foto-01.webp","alt":"Breve descrizione della foto"}],
  "pressReleases":[],
  "coverage":[],
  "relatedUrl":"notizie/",
  "photoCredits":"Fotografie: accreditamento in verifica"
}
```
4. Per i comunicati, aggiungi elementi `{"title":"...","territory":"...","format":"DOCX","url":"assets/documents/gallery-press/comunicati/....docx"}` nell'evento relativo.
5. Per la rassegna, aggiungi elementi `{"id":"...","outlet":"...","territory":"...","title":"...","url":"https://...","date":null,"reported":"2027-03-20","verified":false}`. Una data sconosciuta resta `null`, non inventarla.
6. Aggiorna il valore `version` del JSON e il token `?v=` nel caricamento dati in `assets/js/gallery-press.js` per forzare la cache.
7. Verifica il contenuto pubblicato, le anteprime, i link e la corretta attribuzione fotografica.
8. **Indicizzazione delle fotografie:** aggiungi le nuove immagini in versione `full` (non le miniature) all'elemento `<url>` della pagina `https://giocodisquadra.net/gallery-press/` dentro `sitemap.xml`, usando `<image:image><image:loc>https://giocodisquadra.net/.../foto.webp</image:loc></image:image>`. Aggiorna il suo `<lastmod>` solo quando la pagina cambia realmente. Il workflow di integrità viene eseguito su richiesta o durante le pull request, non a ogni commit, per evitare notifiche ripetute.

## Contatori KPI pubblici

La fascia sotto la testata di `gallery-press/index.html` mostra **quattro KPI di comunicazione**,
invece dei conteggi di fotografie e file. Sono gestiti esclusivamente in
`content/gallery-press.json`, proprietà `communicationKpis`:

- `asOf`: data del rilevamento, formato `AAAA-MM-GG`.
- `items[].current`: quantità documentata o censita al momento dell'aggiornamento.
- `items[].target`: soglia minima prevista dal piano progettuale.
- `items[].label`: titolo pubblico dell'indicatore.
- `items[].detail`: nota breve che chiarisce esattamente cosa viene contato.
- `items[].measurement`: `documented` / `reported` / `published`;
  `reported` mostra una barra tratteggiata, così le segnalazioni non appaiono come uscite certificate; `estimate` distingue la stima di copertura da un risultato consuntivo.
- `items[].minimumTarget`: `true` mostra il prefisso ≥ accanto all'obiettivo.

**Fotografia al 4 novembre 2026:**
1. Campagne stampa: 1/≥3. I sei comunicati del lancio (generale e territoriali)
   sono **una sola campagna**, non sei.
2. Uscite stampa segnalate: 21/≥5. Si contano i collegamenti raccolti nella
   rassegna, non un numero verificato di uscite distinte.
3. Notizie pubblicate: 3/≥10. La quantità corrisponde alle voci presenti in
   `content/news.json`.
4. Copertura potenziale: **oltre 100.000 persone**; è la stima progettuale della platea raggiungibile, **non** una misurazione di persone effettivamente raggiunte. La voce ha `measurement: "estimate"`, `estimate: 100000` e `bound: "more-than"`; non mostra una barra di avanzamento perché manca un consuntivo.

Quando si aggiunge una nuova campagna o notizia, aggiornare il rispettivo `current`,
la nota `detail` e la data `asOf`; non modificare il markup HTML né il CSS.
Per i collegamenti della rassegna aggiornare sia `events[].coverage` che
il conteggio `coverage.current`, evitando doppioni. Dopo variazioni importanti,
aggiornare il parametro di versione nel riferimento JSON in `assets/js/gallery-press.js`
per prevenire la cache vecchia e, se si modifica lo script, anche il parametro
di versione del relativo tag in `gallery-press/index.html`.

Gli altri indicatori di progetto (newsletter, social, template, mailing list) sono
conservati in `strategy` e non vengono esposti come valori di avanzamento finché
non esistono dati di consuntivo affidabili.

## Comunicazione e monitoraggio
I 5 gruppi di KPI riprendono la sezione 11 del Modulo E depositato a marzo 2026. Questi valori sono **target dichiarati**, non risultati già conseguiti.
La proposta originaria parlava di 18 mesi; il calendario effettivo di progetto è ottobre 2026 – dicembre 2027 (15 mesi). Eventuali rimodulazioni vanno esplicitate.
I sei DOCX iniziali costituiscono sei versioni territoriali/generale della stessa azione di lancio; non equivale automaticamente a sei campagne stampa distinte.
I 21 link iniziali sono segnalazioni ricevute da Anna Benedetto; non tutte le date di pubblicazione o gli indirizzi sono stati verificati.

## Materiali da non pubblicare automaticamente
Gli originali della domanda di finanziamento (`Allegato E`, documenti firmati e formulari) sono usati come fonti per le informazioni sulla comunicazione: **non** sono stati inseriti nei materiali pubblici, perché possono contenere dati amministrativi e personali.
Prima di pubblicare le immagini, verificare diritti, attribuzioni e liberatorie, soprattutto per persone riconoscibili e minori.
I sei video contenuti nell'archivio originale della conferenza non fanno parte del pacchetto fotografico iniziale e richiedono una valutazione separata dell'uso pubblico.
L'ufficio stampa permanente e il social media manager restano da definire: i nominativi citati nei singoli comunicati d'archivio non costituiscono una nomina pubblica.

## Controlli e ricerca
- Homepage e pagine principali: menu `Gallery & Press`, aggiunto in HTML.
- Pagine interne: link aggiunto da `assets/js/site.js`, con fallback per le pagine vecchie.
- `sitemap.xml`: la pagina è inserita.
- `gallery-press/index.html`: dati statici sintetici visibili anche senza JavaScript; il dettaglio è alimentato da JSON.
- Non usare caratteri speciali e spazi nei nomi dei file. Preferire lettere minuscole, trattini e suffissi `.webp`, `.pdf`, `.docx`.
