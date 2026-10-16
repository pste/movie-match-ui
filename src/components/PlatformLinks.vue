<script setup>
import { ref, computed, watch } from 'vue';
import { api } from '@/plugins/api';

// I loghi delle piattaforme (Netflix, Disney+...) su cui il film e'
// in abbonamento adesso, come link al film. L'API li chiede a IMDb a ogni
// estrazione, senza salvarli: cambiano di continuo. Quali piattaforme lo
// decide l'API (PLATFORMS in movie-match-api/src/imdb.js): qui non si elencano.
const props = defineProps({
    imdbId: { type: String, required: true },
});

const platforms = ref([]);
// loading finche' IMDb non risponde (non si mostra niente, ne' i loghi ne' il
// fallback), poi ok o error.
const status = ref('loading');

// Il fallback "?" quando nessuna delle piattaforme ha il film, o IMDb non
// risponde: il tooltip dice quale dei due.
const fallbackTooltip = computed(() => {
    if (status.value === 'error') {
        return 'IMDb non risponde: piattaforme non disponibili';
    }
    return 'Non trovato sulle piattaforme in lista';
});

// quiet: se IMDb non risponde basta il fallback, non serve un toast.
// Il controllo sull'id scarta la risposta di un film nel frattempo cambiato.
watch(() => props.imdbId, async (imdbId) => {
    platforms.value = [];
    status.value = 'loading';
    try {
        const result = await api.get(`/imdb/${imdbId}/platforms`, { quiet: true });
        if (imdbId === props.imdbId) {
            platforms.value = result;
            status.value = 'ok';
        }
    }
    catch {
        if (imdbId === props.imdbId) {
            status.value = 'error';
        }
    }
}, { immediate: true });
</script>

<template>
    <div v-if="status !== 'loading'" class="platform-links">
        <span v-if="!platforms.length" class="platform-missing" role="img"
              v-tooltip.top="fallbackTooltip" :aria-label="fallbackTooltip">
            <i class="pi pi-question" />
        </span>
        <a v-for="platform in platforms" :key="platform.name" :href="platform.link"
           target="_blank" rel="noopener noreferrer" class="platform-link"
           v-tooltip.top="`Guarda su ${platform.name}`" :aria-label="`Guarda su ${platform.name}`">
            <img v-if="platform.logo_url" :src="platform.logo_url" :alt="platform.name" class="platform-logo" />
            <span v-else class="platform-name">{{ platform.name }}</span>
        </a>
    </div>
</template>
