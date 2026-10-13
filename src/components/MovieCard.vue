<script setup>
import { computed } from 'vue';
import ImdbLink from '@/components/ImdbLink.vue';
import MoviePoster from '@/components/MoviePoster.vue';

const props = defineProps({
    movie: { type: Object, required: true },
});

// Il regista ha una riga sua: qui solo anno e generi.
const yearGenre = computed(() => [props.movie.year, ...props.movie.genres].filter(Boolean).join(' · '));
</script>

<template>
    <article class="movie-card">
        <MoviePoster :src="movie.poster_url" size="large" />
        <div class="movie-card-body">
            <h2 class="movie-card-title"><ImdbLink :movie="movie" /></h2>
            <div class="text-muted">{{ yearGenre }}</div>
            <div v-if="movie.director">Regia di {{ movie.director }}</div>
            <div v-if="movie.user_name" class="movie-card-user">
                <i class="pi pi-user" /> Proposto da <strong>{{ movie.user_name }}</strong>
            </div>
            <p v-if="movie.notes" class="movie-card-notes">{{ movie.notes }}</p>
            <div class="movie-card-actions">
                <slot />
            </div>
        </div>
    </article>
</template>
