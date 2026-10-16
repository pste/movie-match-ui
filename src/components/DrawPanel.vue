<script setup>
import { ref, computed, watch } from 'vue';
import MovieCard from '@/components/MovieCard.vue';
import PlatformLinks from '@/components/PlatformLinks.vue';
import useMoviesStore from '@/stores/movies';
import useUsersStore from '@/stores/users';

const store = useMoviesStore();
const users = useUsersStore();

// Due filtri facoltativi e combinabili: genere e utente. Con l'utente scelto
// l'estrazione e' a caso fra i suoi film, senza pesi.
const genre = ref(null);
const userId = ref(null);
const busy = ref(false);

const genreOptions = computed(() => store.genres.map((name) => ({ label: name, value: name })));

// Solo gli utenti che hanno almeno un film da vedere: gli altri darebbero
// sempre "nessun film".
const userOptions = computed(() => {
    const withCandidates = new Set(store.toWatch.map((movie) => movie.user_id));
    return users.options.filter((option) => withCandidates.has(option.value));
});

const filters = computed(() => ({ genre: genre.value, userId: userId.value }));
const filtered = computed(() => genre.value || userId.value);

// Quanti film entrano in gioco con i filtri attuali.
const candidates = computed(() => store.toWatch.filter((movie) =>
    (!genre.value || movie.genres.includes(genre.value)) && (!userId.value || movie.user_id === userId.value)
).length);

// Se l'ultimo film di un genere, o di un utente, viene visto o cancellato, il
// filtro resterebbe su un valore che non ha piu' film e l'estrazione
// fallirebbe sempre: si azzera.
watch(() => store.genres, (genres) => {
    if (genre.value && !genres.includes(genre.value)) {
        genre.value = null;
    }
});

watch(userOptions, (options) => {
    if (userId.value && !options.some((option) => option.value === userId.value)) {
        userId.value = null;
    }
});

// Le probabilita' di ogni utente le calcola l'API con la stessa SQL
// dell'estrazione: qui si mostrano e basta. Cambiano col filtro e con la
// lista (film aggiunti, visti, riassegnati): deep perche' la lista cambia
// anche sostituendo una riga, senza un array nuovo.
const odds = ref([]);

watch(() => [filters.value, store.movies], async () => {
    try {
        odds.value = await store.fetchOdds(filters.value, true);
    }
    catch {
        odds.value = [];
    }
}, { deep: true, immediate: true });

function oddsLabel(row) {
    return `${row.user_name || 'Senza utente'} ${Math.round(row.probability * 100)}%`;
}

function oddsTooltip(row) {
    return `${row.candidates} film in gioco, ${row.watched} gia' visti`;
}

async function draw() {
    busy.value = true;
    try {
        await store.draw(filters.value);
    }
    catch {
        // Il toast lo mostra gia' App.vue.
    }
    finally {
        busy.value = false;
    }
}

function markWatched() {
    store.setWatched(store.lastPick.movie, true).catch(() => {});
}
</script>

<template>
    <Card class="draw-panel">
        <template #title>Estrazione</template>
        <template #content>
            <div class="draw-controls">
                <Select v-model="genre" :options="genreOptions" option-label="label" option-value="value"
                        placeholder="Tutti i generi" show-clear :disabled="!genreOptions.length"
                        class="draw-filter" aria-label="Genere" />
                <Select v-model="userId" :options="userOptions" option-label="label" option-value="value"
                        placeholder="Tutti gli utenti" show-clear :disabled="!userOptions.length"
                        class="draw-filter" aria-label="Utente" />
                <!-- Su mobile sale in alto a destra, accanto al titolo (style.css). -->
                <Button label="Estrai" icon="pi pi-sparkles" size="large" class="draw-button"
                        :loading="busy" :disabled="!candidates" @click="draw" />
            </div>
            <!-- Solo quando non c'e' niente da estrarre: spiega perche' "Estrai" e' spento. -->
            <small v-if="!candidates" class="text-muted">
                <template v-if="filtered">Nessun film con questi filtri.</template>
                <template v-else>Nessun film da vedere: aggiungine qualcuno alla lista.</template>
            </small>

            <!-- Chi ha avuto meno film visti ha piu' probabilita' di uscire. -->
            <div v-if="odds.length" class="draw-odds">
                <Tag v-for="row in odds" :key="row.user_id ?? 'none'" :value="oddsLabel(row)"
                     :severity="row.user_id ? 'secondary' : 'warn'" icon="pi pi-user"
                     v-tooltip.top="oddsTooltip(row)" />
            </div>

            <!-- La key fa ripartire l'animazione a ogni estrazione, anche
                 quando esce di nuovo lo stesso film. -->
            <Transition name="pick" mode="out-in">
                <div v-if="store.lastPick" :key="store.lastPick.pick_id" class="draw-result">
                    <Button icon="pi pi-times" severity="secondary" text rounded class="draw-close"
                            v-tooltip.top="'Chiudi'" aria-label="Chiudi" @click="store.lastPick = null" />
                    <MovieCard :movie="store.lastPick.movie">
                        <!-- Dove vederlo: una riga sua, sopra i bottoni. -->
                        <PlatformLinks v-if="store.lastPick.movie.imdb_id" :imdb-id="store.lastPick.movie.imdb_id" />
                        <Tag v-if="store.lastPick.movie.watched" severity="success" value="Visto" icon="pi pi-check" />
                        <!-- Larghi uguale; su mobile uno sotto l'altro, a tutta colonna (style.css). -->
                        <div v-else class="draw-actions">
                            <Button label="Watch it!" icon="pi pi-check" severity="success" @click="markWatched" />
                            <Button label="Un altro" icon="pi pi-refresh" severity="secondary" outlined
                                    :disabled="!candidates || busy" @click="draw" />
                        </div>
                    </MovieCard>
                </div>
            </Transition>
        </template>
    </Card>
</template>
