# movie-match-ui

Web UI di movie-match: Vue 3 + Vite + Pinia + PrimeVue (tema Aura, accento ambra; scuro di
default, con un pulsante nell'header per passare al chiaro, scelta ricordata in `localStorage`).

## Setup

```bash
npm install
cp .env.dist .env
npm run dev            # http://localhost:5173, /api inoltrato all'API su :8000
```

## Struttura

```
src/
├── pages/          Home "/" (estrazione + film candidati), Watched "/visti" (tabella dei visti),
│                   Users "/utenti" (aggiunta, rinomina, eliminazione);
│                   il menu nell'header si costruisce dalle rotte con meta.title
├── components/     DrawPanel, MovieList (da vedere), WatchedTable (scelti), MovieRow, MovieCard,
│                   ImdbSearchDialog (aggiunta: ricerca su IMDb), MovieDialog (genere e note),
│                   ImdbLink,
│                   MoviePoster, AppHeader
├── composables/    usePolling (aggiornamento periodico), useFormat, useTheme,
│                   useMovieActions (visto/da vedere, elimina con conferma)
├── stores/         movies, errors, loading
└── plugins/        registerPlugins: pinia, router, api, PrimeVue, toast, confirm
```

- Aperta, nessun login. Header, caricamento della lista e aggiornamento periodico stanno in
  `App.vue`: cambiando pagina i dati restano in memoria e non si ricaricano.
- La lista si aggiorna ogni 15 secondi (in pausa a scheda nascosta), così si vedono i film
  aggiunti da altri dispositivi.
- Gli errori delle API diventano toast in un posto solo, `App.vue`.
- **Icona sulla home di Android**: `public/manifest.json` (`display: standalone`) e le icone in
  `public/icons/`. Non c'è un service worker, quindi niente offline: Chrome non lo chiede più per
  installare l'app. Il manifest è `.json` perché il nginx dell'immagine non conosce `.webmanifest`.
  Le PNG sono `public/favicon.svg` renderizzato a 192 e 512 px su sfondo trasparente; la
  maskable è 512 px su `#09090b` (lo sfondo scuro dell'app), con il disegno al 78%, dentro la zona
  sicura. Se cambia il favicon vanno rigenerate.

## Immagine

```bash
docker build -f .docker/Dockerfile --build-arg VITE_APP_VERSION=v0.1.0 -t pirraste/movie-match-ui:v0.1.0 .
```

nginx-unprivileged sulla 8080.
