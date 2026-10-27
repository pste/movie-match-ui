<script setup>
import { ref, computed } from 'vue';
import MovieRow from '@/components/MovieRow.vue';
import SearchBox from '@/components/SearchBox.vue';
import MovieDialog from '@/components/MovieDialog.vue';
import ImdbSearchDialog from '@/components/ImdbSearchDialog.vue';
import useMovieActions from '@/composables/useMovieActions';
import useMoviesStore from '@/stores/movies';

// I film ancora da vedere. Quelli gia' scelti stanno in WatchedTable.
const store = useMoviesStore();
const { askDelete } = useMovieActions();

const searchVisible = ref(false);
const editVisible = ref(false);
const editing = ref(null);

// Filtro al volo sul titolo, senza distinzione di maiuscole, e per utente
// (i tag delle probabilita' nel pannello dell'estrazione).
const query = ref('');

const shown = computed(() => {
    const text = query.value.trim().toLowerCase();
    const userIds = store.listUserIds;
    return store.toWatch.filter((movie) =>
        (!text || movie.title.toLowerCase().includes(text)) && (!userIds.length || userIds.includes(movie.user_id))
    );
});

// Col filtro attivo il titolo dice quanti se ne vedono su quanti.
const countLabel = computed(() => {
    if (shown.value.length === store.toWatch.length) {
        return `${store.toWatch.length}`;
    }
    return `${shown.value.length} di ${store.toWatch.length}`;
});

// Estrazione forzata: il film compare nel pannello dell'estrazione, in cima
// alla pagina, e ci si torna. Gli errori li mostra gia' App.vue come toast.
async function pick(movie) {
    try {
        await store.draw({ movieId: movie.movie_id });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    catch {
        // Niente da fare: il toast c'e' gia'.
    }
}

function openEdit(movie) {
    editing.value = movie;
    editVisible.value = true;
}
</script>

<template>
    <SearchBox v-if="store.toWatch.length" v-model="query" placeholder="Cerca un film in lista" />

    <Card class="movie-list">
        <template #title>
            <div class="movie-list-head">
                <span>Film candidati ({{ countLabel }})</span>
                <Button label="Aggiungi" icon="pi pi-plus" size="small" @click="searchVisible = true" />
            </div>
        </template>
        <template #content>
            <ul v-if="shown.length" class="movie-rows">
                <MovieRow v-for="movie in shown" :key="movie.movie_id" :movie="movie"
                          @edit="openEdit" @pick="pick" @delete="askDelete" />
            </ul>
            <p v-else-if="store.toWatch.length && store.listUserIds.length" class="empty-state">Nessun film con questi filtri.</p>
            <p v-else-if="store.toWatch.length" class="empty-state">Nessun film con "{{ query.trim() }}" nel titolo.</p>
            <p v-else class="empty-state">Nessun film da vedere. Aggiungine uno!</p>
        </template>
    </Card>

    <ImdbSearchDialog v-model:visible="searchVisible" />
    <MovieDialog v-model:visible="editVisible" :movie="editing" />
</template>
