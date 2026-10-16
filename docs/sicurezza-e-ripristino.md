# Sicurezza e continuità operativa — Gioco di Squadra
Ultimo audit del codice: 16 ottobre 2026.

## Architettura e rischi
Il sito è statico: HTML/CSS/JS + JSON su GitHub Pages. Non dispone di login per visitatori, moduli che memorizzano dati o database. Rischi dominanti: accesso non autorizzato all'account `federludo`, modifiche errate sul branch `main`, interruzione di servizi terzi (Leaflet su unpkg, tile OpenStreetMap, immagini esterne) e gestione del dominio.

## Priorità immediata: GitHub
1. Sull'account GitHub `federludo`, abilitare passkey o 2FA forte e conservare i codici di recupero fuori dal repository. Non condividere password. Valutare almeno un secondo amministratore autorizzato, con identità individuale.
2. Aprire `https://github.com/federludo/gioco-di-squadra/settings/branches`. Il branch `main` risultava **non protetto** alla verifica del 16/10/2026. Configurare una regola per `main`: impedire eliminazione e force push, richiedere una pull request per le modifiche. Quando il workflow `Integrita del sito` è operativo, richiedere il controllo `check-site` prima del merge. Se c'è un solo manutentore, valutare l'approvazione obbligatoria da una seconda persona per ridurre il rischio.
3. Impostare in `Settings > Actions > General` il token di workflow sui permessi minimi in lettura, dove compatibile con il metodo di pubblicazione. Il workflow dei test usa `permissions: contents: read` e action checkout con commit SHA fissato.
4. Esaminare in `Settings > Collaborators` gli utenti e le app con accesso. Revocare accessi non necessari.

## Sicurezza dominio e HTTPS
1. In `Settings > Pages`, verificare che `giocodisquadra.net` sia il dominio corretto e **Enforce HTTPS** sia attivo.
2. Nell'account GitHub `federludo`, verificare il dominio con il record TXT proposto da GitHub Pages. Questa verifica è **distinta** da quella di Google Search Console e riduce il rischio di takeover.
3. Su Cloudflare, verificare MFA dell'account, assenza di DNS wildcard, dati DNS per root/www e scadenza/rinnovo del dominio.
4. Se si desidera protezione WAF e rate limiting via Cloudflare, prima valutare il passaggio da **DNS only** a **Proxied** (se non già attivo), poi testare HTTPS, redirect canonici, script e mappe. Non attivare regole aggressive contro bot o sfide indiscriminate: possono impedire l'indicizzazione.
5. Con GitHub Pages il semplice file `_headers` non applica header HTTP di sicurezza: `_headers` è una funzionalità di **Cloudflare Pages**, non di GitHub Pages. Se Cloudflare è proxy, configurare gli header di sicurezza via Response Header Transform Rules, testando una CSP inizialmente in modalità report-only prima di applicare blocchi.

## Controlli automatici
`.github/workflows/site-integrity.yml` è un controllo non distruttivo su push/PR/manuale; `scripts/check-site.py` verifica le pagine, la sitemap, i file locali, i JSON, i profili e gli elementi della home/mappa/calendario. La sintassi dei JS viene verificata con `node --check`. Sono controlli statici, non sostituiscono test visuali o audit di dipendenze e non bloccano da soli le modifiche finché il branch non richiede il check.

## Ripristino e backup
- Git conserva la cronologia dei commit, utile per ripristinare modifiche sbagliate; **non è un backup esterno** contro compromissione o cancellazione del repository.
- Esportare periodicamente `Code > Download ZIP` e archiviare una copia separata del repository (inclusi `content/`, `assets/` e `CNAME`), preferibilmente con versioni datate. Conservare separatamente i dati DNS e le configurazioni amministrative.
- In caso di guasto a una singola modifica, effettuare un **revert del commit** tramite GitHub, non riscrivere la storia di `main`. Verificare dopo il ripristino home, calendario, mappa, carosello e schede partner.
- Un controllo esterno di disponibilità (HTTPS homepage, sitemap, pagina calendario e pagina partenariato) completa i test interni e permette notifiche quando il sito non risponde.

## Dipendenze terze
- Leaflet 1.9.4 viene caricato con hash di integrità SRI, una buona misura contro alterazioni del CDN, ma **non** contro l'interruzione del CDN. Valutare un asset locale verificato e testato prima di cambiarlo.
- Le tile OpenStreetMap e alcune foto esterne dipendono da fornitori esterni. Se il fornitore non risponde, il resto del sito deve continuare a mostrare testo, profili e calendario.
- Non conservare nel repository password, token API, codici di recupero, dati personali non destinati alla pubblicazione o informazioni riservate.
