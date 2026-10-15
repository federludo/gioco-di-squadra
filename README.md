# Gioco di Squadra

Sito ufficiale del progetto **Gioco di Squadra — Metodologie ludiche per il sociale**, coordinato da Federludo APS.

## Pubblicazione

Sito statico senza build obbligatoria, predisposto per GitHub Pages e il dominio `giocodisquadra.net`.

Le pagine usano contenuti dimostrativi contrassegnati come tali finché i dati istituzionali, le date e i partner non vengono verificati.

## Struttura

- `index.html`: home
- `progetto/`, `attivita/`, `partenariato/`, `calendario/`, `notizie/`, `contatti/`: sezioni
- `partner/`, `evento/`, `notizia/`: schede individuali
- `content/`: dati JSON
- `assets/css/`, `assets/js/`, `assets/images/`, `assets/documents/`: risorse
- `docs/`: guide e indicazioni operative

## Dominio

In Settings → Pages pubblicare dal branch `main` e dalla cartella `/ (root)`; associare `giocodisquadra.net`, configurare i DNS su Cloudflare e attivare HTTPS. Vedi `docs/dominio-cloudflare.md`.

Non inserire date, crediti, loghi istituzionali e contatti non verificati.