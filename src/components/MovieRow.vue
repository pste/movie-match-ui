<script setup>
import ImdbLink from '@/components/ImdbLink.vue';
import MoviePoster from '@/components/MoviePoster.vue';
import { movieMeta } from '@/composables/useFormat';

defineProps({
    movie: { type: Object, required: true },
});

defineEmits(['edit', 'toggle-watched', 'delete']);
</script>

<template>
    <li class="movie-row">
        <MoviePoster :src="movie.poster_url" />
        <div class="movie-row-body">
            <div class="movie-row-title"><ImdbLink :movie="movie" /></div>
            <small class="text-muted">{{ movieMeta(movie) }}</small>
            <!-- L'utente a capo, sotto anno e regista. -->
            <div class="movie-row-user">
                <Tag v-if="movie.user_name" :value="movie.user_name" icon="pi pi-user" class="movie-row-tag" />
                <Tag v-else value="Senza utente" severity="warn" icon="pi pi-user" class="movie-row-tag"
                     v-tooltip.top="'Assegnalo a qualcuno con la matita'" />
            </div>
        </div>
        <div class="movie-row-actions">
            <Button :icon="movie.watched ? 'pi pi-undo' : 'pi pi-check'" severity="secondary" text rounded
                    v-tooltip.top="movie.watched ? 'Rimetti fra i da vedere' : 'Segna come visto'"
                    :aria-label="movie.watched ? 'Rimetti fra i da vedere' : 'Segna come visto'"
                    @click="$emit('toggle-watched', movie)" />
            <Button icon="pi pi-pencil" severity="secondary" text rounded
                    v-tooltip.top="'Modifica'" aria-label="Modifica" @click="$emit('edit', movie)" />
            <Button icon="pi pi-trash" severity="danger" text rounded
                    v-tooltip.top="'Elimina'" aria-label="Elimina" @click="$emit('delete', movie)" />
        </div>
        <!-- I generi IMDb su una riga loro, sotto tutto il film: un film ne ha anche cinque. -->
        <div v-if="movie.genres.length" class="movie-row-genres">
            <Tag v-for="name in movie.genres" :key="name" :value="name" severity="secondary"
                 class="movie-row-genre" />
        </div>
    </li>
</template>
