# Homepage editoriale e notizie (versione ottobre 2026)

## Pagine e file
- Home: `index.html`, `assets/css/home.css`, `assets/js/home.js`
- Archivio «Storie e news»: `notizie/index.html`
- Prima notizia: `notizie/progetto-finanziato/index.html`
- Dati notizie: `content/news.json` — unico archivio letto sia dalla home sia dall'archivio
- Componenti news: `assets/js/news.js`, `assets/css/stories.css`

## Come pubblicare una nuova notizia
1. Preparare e approvare titolo, testo, data, fotografie e crediti.
2. Creare `notizie/<slug>/index.html` sulla base della prima pagina editoriale.
3. Inserire un record con `id`, `slug`, `title`, `category`, `status`, `date`, `excerpt`, `image`, `imageAlt`, `url` in `content/news.json`.
4. Impostare `status: "published"` soltanto quando il testo è approvato, `status: "draft"` per anteprime chiaramente identificate.
5. La nuova notizia appare automaticamente in «Storie e news» e (fino a 3 notizie) nella homepage. Il campo `featured` favorisce la notizia in testa.

La **notizia sul finanziamento** è pubblicata con titolo e dati verificati. La copertina editoriale in `assets/images/news/gioco-di-squadra-finanziamento-cover.svg` è temporanea e può essere sostituita tramite `content/news.json`, senza modificare la griglia dell'archivio.

## Programmazione
- La sezione appuntamenti legge `content/events.json`; tutte le schede con `date: null` mostrano «Date in aggiornamento».
- L'evento e la scheda partner hanno già collegamenti stabili. Non pubblicare date non confermate.

## Asset e performance
- Stili **separati** da `assets/css/site.css` per proteggere il resto del sito.
- Animazioni: IntersectionObserver e lieve movimento del fondale; le preferenze `prefers-reduced-motion` disattivano gli effetti.
- Le fotografie correnti sono illustrative. Il hero usa la foto libera di 2H Media, le pedine un'immagine libera di Christopher Paul High; crediti in `docs/home-visual-sources.json` e in fondo alla home.
- È consigliato sostituire le fotografie con materiali delle attività realmente svolte, autorizzati, ottimizzati WebP/AVIF e archiviati in `assets/images/home/`.
- Finché il sito è in fase di verifica, le pagine conservano `noindex,nofollow` della prima installazione; valutare la rimozione coordinata nel lancio ufficiale.
