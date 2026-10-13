<script setup>
import ImdbLink from '@/components/ImdbLink.vue';
import MoviePoster from '@/components/MoviePoster.vue';
import useMovieActions from '@/composables/useMovieActions';
import { formatDate } from '@/composables/useFormat';
import useMoviesStore from '@/stores/movies';

// I film scelti davvero: quelli segnati come visti ("Lo guardiamo!"). La data
// e' il momento in cui sono stati scelti, cioe' movies.watched.
const store = useMoviesStore();
const { toggleWatched, askDelete } = useMovieActions();
</script>

<template>
    <Card class="watched-panel">
        <template #title>Film visti ({{ store.watched.length }})</template>
        <template #content>
            <DataTable :value="store.watched" data-key="movie_id" sort-field="watched" :sort-order="-1"
                       :paginator="store.watched.length > 10" :rows="10" size="small" striped-rows
                       class="watched-table">
                <template #empty>
                    <p class="empty-state">Nessun film visto, per ora: estraine uno!</p>
                </template>

                <Column header="" class="col-poster">
                    <template #body="{ data }">
                        <MoviePoster :src="data.poster_url" />
                    </template>
                </Column>
                <Column field="watched" header="Data estrazione" sortable>
                    <template #body="{ data }">{{ formatDate(data.watched) }}</template>
                </Column>
                <Column field="title" header="Titolo" sortable>
                    <template #body="{ data }"><ImdbLink :movie="data" /></template>
                </Column>
                <Column field="year" header="Anno" sortable />
                <Column field="director" header="Regia" sortable />
                <Column field="user_name" header="Proposto da" sortable />
                <Column header="Generi">
                    <template #body="{ data }">{{ data.genres.join(', ') }}</template>
                </Column>
                <Column field="notes" header="Note" />
                <Column header="" class="col-actions">
                    <template #body="{ data }">
                        <Button icon="pi pi-undo" severity="secondary" text rounded
                                v-tooltip.top="'Rimetti fra i da vedere'" aria-label="Rimetti fra i da vedere"
                                @click="toggleWatched(data)" />
                        <Button icon="pi pi-trash" severity="danger" text rounded
                                v-tooltip.top="'Elimina'" aria-label="Elimina" @click="askDelete(data)" />
                    </template>
                </Column>
            </DataTable>
        </template>
    </Card>
</template>
