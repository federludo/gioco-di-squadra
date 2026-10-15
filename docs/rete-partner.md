# La rete di Gioco di Squadra — guida tecnica

La fonte di verità è `content/organizations.json`: 11 soggetti di progetto (Federludo + 10 partner), 16 sostenitori. Le schede statiche vivono in `partner/<slug>/` e `sostenitore/<slug>/`; tutte vengono completate da `assets/js/network.js`. Le immagini approvate vanno in `assets/images/partners/` e `assets/images/supporters/`.

## Dati e verifiche
- Il **piano operativo** descrive impegni e finestre programmatiche, NON eventi già svolti; le date confermate appartengono al calendario `content/events.json`.
- I punti sulla mappa rappresentano **centri comunali indicativi**, non sedi legali né luoghi degli eventi; comuni coincidenti vengono aggregati in un marcatore unico.
- Associazioni senza fonte ufficiale verificata mantengono la proprietà `website: null`.
- `image: null` produce un monogramma identificativo: non considerarlo un logo ufficiale dell'associazione.
- La sede legale nel formulario, il punto mappa, e la sede concreta degli incontri possono essere tre posti distinti; non approssimare automaticamente uno come l'altro.
- I documenti originali contengono dati bancari/personali e **non vanno caricati nel repo pubblico**.
- Alcune fonti online possono presentare recapiti differenti rispetto alla modulistica; meglio usare l'email di contatto pubblico presente sul sito del soggetto e chiedere conferma se necessario.

## Come aggiungere un logo
1. Ottenere il file e l'autorizzazione all'uso dal soggetto oppure reperirlo da una fonte ufficiale che ne permetta il riutilizzo.
2. Salvare SVG o PNG in `assets/images/partners/<id>.svg` oppure `assets/images/supporters/<id>.png`.
3. Nel record `image` inserire il percorso locale a partire da `assets/images/` (es. `assets/images/partners/kraken.svg`) oppure un URL HTTPS affidabile.
4. Non caricare fotografie non autorizzate o stemmi ufficiali in bassa risoluzione provenienti da portali terzi.

## Struttura programma-calendario
Ogni scheda progetto possiede un `id` stabile e una lista di attività con `title`, `code` (A1–A5), `window`, `description`. In `content/events.json` per i singoli incontri aggiungere `organizerId` corrispondente all'ID del partner e data ISO solo quando confermata. Il filtro URL `/calendario/?partner=<id>` mostra gli incontri associati.

## Frontend
- Leaflet 1.9.4 da CDN e OpenStreetMap con attribuzione. I listati sono sempre disponibili anche se la CDN cartografica non risponde.
- `assets/css/network.css` è circoscritto alle pagine della rete; non altera la home.
- Non pubblicare i dati personali di referenti senza richiesta/autorizzazione.
