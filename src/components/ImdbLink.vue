<script setup>
import { imdbUrl } from '@/composables/useFormat';

// Il titolo di un film, come link alla sua scheda IMDb in una nuova scheda.
defineProps({
    movie: { type: Object, required: true },
});
</script>

<template>
    <a :href="imdbUrl(movie.imdb_id)" target="_blank" rel="noopener noreferrer" class="imdb-link"
       v-tooltip.top="'Apri su IMDb'">
        {{ movie.title }}<i class="pi pi-external-link imdb-link-icon" />
    </a>
</template>
