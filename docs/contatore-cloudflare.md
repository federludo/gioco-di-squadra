# Contatore Cloudflare per Gioco di Squadra

**Obiettivo:** replicare il contatore di biodiversitylab.net, cioè un valore globale persistente in un **Cloudflare Durable Object** che aumenta **una sola volta per sessione del browser**. Le pagine del sito restano ospitate su GitHub Pages. Il numero compare discretamente nel footer con un piccolo pallino verde. Il precedente badge Hits.sh è stato rimosso.

## Passaggio 1 — Attivare Workers + Durable Objects

1. Entra su https://dash.cloudflare.com/ con l'account che gestisce `giocodisquadra.net`.
2. Vai a **Workers & Pages**. Se non hai ancora usato Workers, completa la procedura iniziale per ottenere il sottodominio `*.workers.dev`. Il piano Workers Free supporta i Durable Objects con archivio SQLite.
3. **Non** migrare il sito a Cloudflare Pages. Non eliminare alcuna configurazione GitHub Pages. Il nuovo servizio si chiamerà `giocodisquadra-visit-counter`.

## Passaggio 2 — Pubblicare il piccolo servizio

Questa fase richiede una sola volta Node.js e Wrangler sul tuo computer. Non serve creare manualmente un Durable Object dal pannello: Wrangler lo crea dal file `wrangler.jsonc`.

Da Fedora, se Node.js e npm non sono installati: `sudo dnf install nodejs npm git`.

Apri un terminale in una cartella di lavoro:

```bash
git clone https://github.com/federludo/gioco-di-squadra.git
cd gioco-di-squadra
npx wrangler@latest login
npx wrangler@latest deploy --config cloudflare/visit-counter/wrangler.jsonc
```

Wrangler mostrerà l'indirizzo pubblico `https://giocodisquadra-visit-counter.<tuo-account>.workers.dev`, da cui provare `/api/visits` con una richiesta GET. Il risultato iniziale atteso è `{"count":0}`. Non sostituire `<tuo-account>` con un valore casuale: usa l'indirizzo esatto restituito dal comando.

È possibile che Cloudflare richieda di selezionare l'account quando ci sono più account associati. Il namespace dei Durable Objects è indipendente da quello di BiodiversityLab.

## Passaggio 3 — Mettere Cloudflare davanti al dominio (solo se necessario)

Vai in **Websites > giocodisquadra.net > DNS > Records**. Controlla i record A del dominio principale `@` e la colonna **Proxy status**:
- Se è già **Proxied**, nuvola arancione, non modificare i record.
- Se è **DNS only**, nuvola grigia, cambia in **Proxied** i record che servono `giocodisquadra.net` (non toccare record MX, TXT di posta, record di Google Search Console o record di altri sottodomini). I Worker Routes richiedono traffico che attraversa il proxy Cloudflare.
- Verifica il sito `https://giocodisquadra.net/`, HTTPS, la pagina progetto, la mappa e il calendario dopo la modifica. Se il sito non funziona come prima, riporta temporaneamente il proxy a **DNS only** e non proseguire.

## Passaggio 4 — Associare solo l'API al Worker

Su Cloudflare vai a **Workers & Pages > Overview > giocodisquadra-visit-counter > Settings > Domains & Routes > Add > Route**.

- **Zone**: `giocodisquadra.net`.
- **Route pattern**: `giocodisquadra.net/api/visits`.
- Salva con **Add route**.

**Non impostare** `giocodisquadra.net/*`: intercetterebbe anche la homepage e le altre pagine, che devono invece rimanere su GitHub Pages. Non selezionare **Custom Domain** per il dominio principale.

Apri quindi `https://giocodisquadra.net/api/visits`. Dovresti vedere un JSON `{"count":0}` o il valore che è già stato accumulato.

## Passaggio 5 — Verifica sulla homepage

- Apri `https://giocodisquadra.net/`: il numero e il pallino verde compaiono nel footer.
- Ricarica la stessa scheda: il valore non dovrebbe aumentare.
- Apri una nuova sessione del browser o una finestra privata: viene conteggiata una nuova sessione.
- Se l'API non è disponibile, il contatore resta nascosto e il sito continua a funzionare.

Nota: il sistema conta sessioni di browser, non persone uniche. Un dispositivo o browser diverso conta come una sessione nuova. Non è un servizio di analisi del traffico o di statistiche SEO.

## Risoluzione dei problemi

- Se `/api/visits` restituisce una pagina GitHub di errore, la **Route** non è configurata o il traffico non passa dal proxy Cloudflare.
- Se restituisce 500/503, verificare il **Durable Object binding** `VISIT_COUNTER` e le distribuzioni del Worker.
- Se il valore rimane non visibile, aprire gli strumenti di sviluppo e controllare la richiesta `POST /api/visits`.
- Se una pagina del sito smette di funzionare dopo l'attivazione del proxy, ripristinare i record DNS su `DNS only` e verificare SSL/TLS prima di intervenire ulteriormente.
- Non azzerare i Durable Objects o eliminare il Worker, perché i contatori possono perdere la cronologia.

## Codice

- `cloudflare/visit-counter/index.js`: Worker e classe Durable Object.
- `cloudflare/visit-counter/wrangler.jsonc`: configurazione di Wrangler.
- `assets/js/site.js` e `assets/css/site.css`: componente di visualizzazione, condiviso dalle pagine del sito.

Cloudflare Docs: https://developers.cloudflare.com/durable-objects/get-started/ e https://developers.cloudflare.com/workers/configuration/routing/routes/
