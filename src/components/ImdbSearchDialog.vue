<script setup>
import { ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import ImdbLink from '@/components/ImdbLink.vue';
import MoviePoster from '@/components/MoviePoster.vue';
import { formatDate, movieMeta } from '@/composables/useFormat';
import useMoviesStore from '@/stores/movies';
import useUsersStore from '@/stores/users';

// Aggiunta di un film: si sceglie chi lo propone, si scrive il titolo, si
// cerca su IMDb, si sceglie il risultato giusto.
const visible = defineModel('visible', { type: Boolean, default: false });

const store = useMoviesStore();
const users = useUsersStore();
const toast = useToast();

const userId = ref(null);

// Chi propone: vuoto a ogni apertura, va scelto ogni volta; solo se c'e' un
// utente unico e' gia' lui.
function defaultUserId() {
    return users.users.length === 1 ? users.users[0].user_id : null;
}

const SEARCH_DELAY_MS = 400;

const query = ref('');
const results = ref([]);
const searching = ref(false);
const searched = ref(false);
const adding = ref(null);

let timer = null;
// Solo l'ultima ricerca partita puo' scrivere i risultati: una risposta lenta
// a "ali" non deve coprire quella, gia' arrivata, di "alien".
let lastRequest = 0;

async function search() {
    clearTimeout(timer);
    const text = query.value.trim();
    if (text.length < 2) {
        results.value = [];
        searched.value = false;
        return;
    }
    const request = ++lastRequest;
    searching.value = true;
    try {
        const found = await store.searchImdb(text);
        if (request === lastRequest) {
            results.value = found;
            searched.value = true;
        }
    }
    catch {
        // Il toast lo mostra gia' App.vue.
    }
    finally {
        if (request === lastRequest) {
            searching.value = false;
        }
    }
}

// Si cerca mentre si scrive, appena ci si ferma un attimo; Invio cerca subito.
watch(query, () => {
    clearTimeout(timer);
    timer = setTimeout(search, SEARCH_DELAY_MS);
});

// Ogni apertura riparte da vuoto.
watch(visible, (open) => {
    if (open) {
        query.value = '';
        results.value = [];
        searched.value = false;
        userId.value = defaultUserId();
    }
});

async function add(result) {
    adding.value = result.imdb_id;
    try {
        await store.addMovie(result, userId.value);
        toast.add({ severity: 'success', summary: 'Aggiunto', detail: result.title, life: 2500 });
        visible.value = false;
    }
    catch {
        // Il toast lo mostra gia' App.vue.
    }
    finally {
        adding.value = null;
    }
}
</script>

<template>
    <Dialog v-model:visible="visible" modal header="Aggiungi un film" class="imdb-dialog" :draggable="false">
        <!-- Senza utenti non si puo' proporre niente: prima vanno creati. -->
        <Message v-if="!users.users.length" severity="warn" :closable="false">
            Prima crea almeno un utente nella pagina
            <RouterLink :to="{ name: 'users' }" @click="visible = false">Utenti</RouterLink>.
        </Message>
        <div v-else class="imdb-user">
            <label for="imdb-user">Proposto da</label>
            <Select v-model="userId" input-id="imdb-user" :options="users.options" option-label="label"
                    option-value="value" placeholder="Chi lo propone?" class="imdb-user-select" />
        </div>

        <form class="imdb-search" @submit.prevent="search">
            <IconField>
                <InputIcon :class="searching ? 'pi pi-spin pi-spinner' : 'pi pi-search'" />
                <InputText v-model="query" placeholder="Titolo del film" maxlength="100" autofocus
                           class="w-full" aria-label="Titolo del film" />
            </IconField>
        </form>

        <ul v-if="results.length" class="imdb-results">
            <li v-for="result in results" :key="result.imdb_id" class="imdb-result">
                <MoviePoster :src="result.poster_url" :lazy="false" />
                <div class="movie-row-body">
                    <div class="movie-row-title"><ImdbLink :movie="result" /></div>
                    <small class="text-muted">{{ movieMeta(result) }}</small>
                    <div v-if="result.genres.length" class="text-muted imdb-result-genres">
                        {{ result.genres.join(', ') }}
                    </div>
                </div>
                <Tag v-if="store.isInList(result.imdb_id)" value="In lista" severity="secondary" icon="pi pi-check" />
                <template v-else>
                    <!-- Gia' visto: si puo' rimettere in lista, ma va detto. -->
                    <Tag v-if="store.lastWatched(result.imdb_id)" severity="info" icon="pi pi-eye"
                         :value="`Già visto il ${formatDate(store.lastWatched(result.imdb_id))}`" />
                    <Button :label="store.lastWatched(result.imdb_id) ? 'Aggiungi di nuovo' : 'Aggiungi'"
                            icon="pi pi-plus" size="small"
                            :loading="adding === result.imdb_id" :disabled="adding !== null || !userId"
                            @click="add(result)" />
                </template>
            </li>
        </ul>
        <p v-else-if="searched && !searching" class="empty-state">Nessun film trovato su IMDb.</p>
        <p v-else class="empty-state">Scrivi il titolo: i risultati arrivano da IMDb.</p>
    </Dialog>
</template>
