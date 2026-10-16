# Indicizzazione di Gioco di Squadra

Dominio canonico: https://giocodisquadra.net/

## Pubblicazione

Il sito è statico su GitHub Pages. Ogni pagina pubblica destinata alla ricerca deve avere un titolo specifico, una meta description, il tag robots index,follow, un canonical assoluto e testo significativo visibile anche senza JavaScript quando possibile. Non inserire elenchi ripetitivi di parole chiave.

La pagina /evento/ e la rotta generica /partner/ sono template senza contenuto specifico: devono restare noindex, così come /404.html. Se si creeranno pagine autonome per ogni evento, aggiungerle alla sitemap solo quando avranno contenuto reale e URL stabili.

## Sitemap

Aggiornare `sitemap.xml` a ogni pubblicazione di nuove pagine indicizzabili, con il loro URL canonico e, quando il contenuto cambia in modo sostanziale, la data `lastmod` corretta. Evitare URL con parametri e pagine marcate noindex.

## Search Console

1. Accedere a https://search.google.com/search-console con un account autorizzato alla proprietà del dominio.
2. Verificare la proprietà `sc-domain:giocodisquadra.net` tramite record TXT DNS, oppure proprietà con prefisso `https://giocodisquadra.net/` se già verificata.
3. Aprire **Sitemap** e aggiungere `https://giocodisquadra.net/sitemap.xml`.
4. Usare **Controllo URL** per home, progetto, partenariato e almeno due schede partner. Dopo pubblicazione, richiedere l'indicizzazione delle pagine prioritarie.
5. Monitorare **Indicizzazione > Pagine**, **Rendimento > Risultati di ricerca**, titoli, click e query per 2–4 settimane. La sitemap non garantisce l'indicizzazione.
6. Ottenere collegamenti editoriali reali verso il sito dai siti dei partner, di Federludo e dalle comunicazioni pubbliche pertinenti.

## Priorità contenuti

Query pertinenti: Gioco di Squadra Federludo, giochi da tavolo inclusione sociale, giochi di ruolo educazione non formale, LARP e comunità, associazioni ludiche in Toscana, laboratori ludici Toscana, partner del progetto Gioco di Squadra. Usarle naturalmente in testi specifici, notizie di attività realmente svolte e pagine che descrivono i metodi. Aggiornare eventi e notizie con date e luoghi confermati: evitare date inventate.

## Controlli

Verificare dopo ogni modifica che canonical, URL della sitemap, titolo e JSON-LD puntino al dominio scelto. Google può riscrivere gli snippet e decidere autonomamente quali pagine indicizzare.
