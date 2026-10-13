<script setup>
import { ref } from 'vue';
import MovieRow from '@/components/MovieRow.vue';
import MovieDialog from '@/components/MovieDialog.vue';
import ImdbSearchDialog from '@/components/ImdbSearchDialog.vue';
import useMovieActions from '@/composables/useMovieActions';
import useMoviesStore from '@/stores/movies';

// I film ancora da vedere. Quelli gia' scelti stanno in WatchedTable.
const store = useMoviesStore();
const { toggleWatched, askDelete } = useMovieActions();

const searchVisible = ref(false);
const editVisible = ref(false);
const editing = ref(null);

function openEdit(movie) {
    editing.value = movie;
    editVisible.value = true;
}
</script>

<template>
    <Card class="movie-list">
        <template #title>
            <div class="movie-list-head">
                <span>Film candidati ({{ store.toWatch.length }})</span>
                <Button label="Aggiungi" icon="pi pi-plus" size="small" @click="searchVisible = true" />
            </div>
        </template>
        <template #content>
            <ul v-if="store.toWatch.length" class="movie-rows">
                <MovieRow v-for="movie in store.toWatch" :key="movie.movie_id" :movie="movie"
                          @edit="openEdit" @toggle-watched="toggleWatched" @delete="askDelete" />
            </ul>
            <p v-else class="empty-state">Nessun film da vedere. Aggiungine uno!</p>
        </template>
    </Card>

    <ImdbSearchDialog v-model:visible="searchVisible" />
    <MovieDialog v-model:visible="editVisible" :movie="editing" />
</template>
