import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/plugins/api';

// Ordine alfabetico all'italiana, senza distinzione di maiuscole e accenti.
function byTitle(a, b) {
    return a.title.localeCompare(b.title, 'it', { sensitivity: 'base' });
}

// La lista dei film: da vedere e gia' scelti (watched valorizzato).
const useMoviesStore = defineStore('movies', () => {
    const movies = ref([]);
    // L'ultima estrazione fatta da QUESTA pagina, mostrata in grande.
    const lastPick = ref(null);

    // I candidati sempre per titolo. L'API li manda gia' ordinati, ma un film
    // appena aggiunto o rimesso fra i da vedere entra in fondo all'array
    // (replaceMovie) e ci resterebbe fino al prossimo caricamento.
    const toWatch = computed(() => movies.value.filter((movie) => !movie.watched).sort(byTitle));
    const watched = computed(() => movies.value.filter((movie) => movie.watched));

    // I generi presenti fra i film da vedere: sono le uniche scelte sensate
    // per il filtro dell'estrazione. Ogni film ne ha di solito da uno a tre.
    const genres = computed(() => {
        const names = toWatch.value.flatMap((movie) => movie.genres);
        return [...new Set(names)].sort((a, b) => a.localeCompare(b, 'it'));
    });

    // quiet: e' anche l'aggiornamento periodico, che deve restare silenzioso.
    async function load(quiet = false) {
        movies.value = await api.get('/movies', { quiet });
    }

    // I film tornano dall'API gia' completi: si sostituisce la riga invece di
    // ricaricare tutta la lista.
    function replaceMovie(movie) {
        const index = movies.value.findIndex((item) => item.movie_id === movie.movie_id);
        if (index >= 0) {
            movies.value.splice(index, 1, movie);
        }
        else {
            movies.value.push(movie);
        }
        if (lastPick.value?.movie.movie_id === movie.movie_id) {
            lastPick.value = { ...lastPick.value, movie };
        }
    }

    // I risultati non si tengono nello store: servono solo al dialog di ricerca.
    function searchImdb(query) {
        return api.get(`/imdb/search?q=${encodeURIComponent(query)}`);
    }

    // In lista = fra i da vedere. Un film gia' visto non e' "in lista": si
    // puo' riaggiungere, e la vecchia visione resta nella storia.
    function isInList(imdbId) {
        return toWatch.value.some((movie) => movie.imdb_id === imdbId);
    }

    // L'ultima volta che un film e' stato visto, o null se mai. Puo' esserci
    // piu' di una visione: conta la piu' recente.
    function lastWatched(imdbId) {
        const dates = watched.value.filter((movie) => movie.imdb_id === imdbId).map((movie) => movie.watched);
        return dates.length ? dates.sort().at(-1) : null;
    }

    // result e' un risultato di searchImdb, rimandato cosi' com'e', piu' chi
    // propone il film.
    async function addMovie(result, userId) {
        replaceMovie(await api.post('/movies', { ...result, user_id: userId }));
    }

    // Solo i campi nostri: titolo, anno, locandina, regista e generi vengono
    // da IMDb.
    async function updateMovie(movie, { notes, userId }) {
        replaceMovie(await api.put(`/movies/${movie.movie_id}`, { notes, user_id: userId }));
    }

    // Le probabilita' di ogni utente all'estrazione, con lo stesso filtro.
    // filters: { genre, userId }, entrambi facoltativi.
    function fetchOdds({ genre, userId }, quiet = false) {
        const params = new URLSearchParams();
        if (genre) {
            params.set('genre', genre);
        }
        if (userId) {
            params.set('user_id', userId);
        }
        const query = params.size ? `?${params}` : '';
        return api.get(`/draw/odds${query}`, { quiet });
    }

    async function setWatched(movie, value) {
        replaceMovie(await api.put(`/movies/${movie.movie_id}/watched`, { watched: value }));
    }

    async function deleteMovie(movie) {
        await api.del(`/movies/${movie.movie_id}`);
        movies.value = movies.value.filter((item) => item.movie_id !== movie.movie_id);
        if (lastPick.value?.movie.movie_id === movie.movie_id) {
            lastPick.value = null;
        }
    }

    // filters: { genre, userId }, gli stessi di fetchOdds. movieId e'
    // l'estrazione forzata di quel film (il "visto" della lista).
    async function draw({ genre, userId, movieId }) {
        const pick = await api.post('/draw', { genre, user_id: userId, movie_id: movieId });
        lastPick.value = pick;
        return pick;
    }

    return {
        movies, lastPick, toWatch, watched, genres,
        load, searchImdb, isInList, lastWatched, addMovie, updateMovie, fetchOdds, setWatched, deleteMovie, draw,
    };
});

export default useMoviesStore;
