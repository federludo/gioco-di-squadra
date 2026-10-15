# Pubblicare giocodisquadra.net

1. In GitHub: Settings → Pages → Build and deployment → Deploy from a branch, branch `main`, folder `/(root)`. Save.
2. In Settings → Pages, Custom domain, inserire `giocodisquadra.net`. Il file `CNAME` nella radice contiene lo stesso dominio.
3. In Cloudflare → giocodisquadra.net → DNS → Records, creare i seguenti record, preferibilmente **DNS only** (nuvola grigia) durante la configurazione:

| Type | Name | Content |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | federludo.github.io |

4. Rimuovere eventuali altri record A, AAAA o CNAME che confliggono con @ o www; non modificare record MX/TXT dedicati alla posta.
5. Dopo propagazione DNS, verificare che GitHub Pages riconosca il dominio e che il certificato sia disponibile. Attivare **Enforce HTTPS**.
6. Verificare `https://giocodisquadra.net` e `https://www.giocodisquadra.net` e il reindirizzamento canonico.

**Nota**: il collegamento Cloudflare non è attualmente autorizzato in ChatGPT. Queste modifiche DNS e l'attivazione delle impostazioni Pages richiedono un operatore con accesso ai pannelli. Non confondere l'esistenza del file CNAME con il sito già online. Prima della pubblicazione istituzionale vanno validati testi, partner e immagini.