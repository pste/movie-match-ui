<script setup>
import { ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { api } from '@/plugins/api';
import crunchyrollLogo from '@/assets/platforms/crunchyroll.webp';
import disneyplusLogo from '@/assets/platforms/disneyplus.webp';
import netflixLogo from '@/assets/platforms/netflix.webp';
import primevideoLogo from '@/assets/platforms/primevideo.webp';

// I loghi delle piattaforme (Netflix, Disney+...) su cui il film e'
// in abbonamento adesso: il clic copia il link al film. L'API li chiede a IMDb a ogni
// estrazione, senza salvarli: cambiano di continuo. Quali piattaforme lo
// decide l'API (PLATFORMS in movie-match-api/src/imdb.js): qui non si elencano.
const props = defineProps({
    imdbId: { type: String, required: true },
});

// I loghi nostri, gia' 5:2, per nome (lo stesso di PLATFORMS nell'API): quelli
// di IMDb sono 16:9 e ritagliati vengono male. Per una piattaforma senza logo
// qui si usa quello di IMDb (logo_url).
const LOCAL_LOGOS = {
    'Netflix': netflixLogo,
    'Disney+': disneyplusLogo,
    'Prime Video': primevideoLogo,
    'Crunchyroll': crunchyrollLogo,
};

function logoUrl(platform) {
    return LOCAL_LOGOS[platform.name] ?? platform.logo_url;
}

const toast = useToast();

// Il link va negli appunti, non si apre. navigator.clipboard esiste solo in
// HTTPS (o su localhost): altrove la copia fallisce e lo dice il toast.
async function copyLink(platform) {
    try {
        await navigator.clipboard.writeText(platform.link);
        toast.add({ severity: 'success', summary: 'Link copiato', detail: platform.name, life: 2500 });
    }
    catch {
        toast.add({ severity: 'error', summary: 'Copia non riuscita', detail: platform.link, life: 5000 });
    }
}

const platforms = ref([]);
// loading finche' IMDb non risponde, poi ok o error.
const status = ref('loading');

// Il fallback "?" finche' non ci sono loghi: mentre IMDb risponde, quando
// nessuna delle piattaforme ha il film, o IMDb non risponde. Il tooltip dice
// quale dei tre.
const fallbackTooltip = computed(() => {
    if (status.value === 'loading') {
        return 'Cerco le piattaforme...';
    }
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
    <div class="platform-links">
        <div v-if="!platforms.length" class="platform-missing" role="img"
             v-tooltip.top="fallbackTooltip" :aria-label="fallbackTooltip">
            <i class="pi pi-desktop" />
            <span>Non disponibile</span>
        </div>
        <button v-for="platform in platforms" :key="platform.name" type="button" class="platform-link"
                :disabled="!platform.link" @click="copyLink(platform)"
                v-tooltip.top="`Copia il link di ${platform.name}`" :aria-label="`Copia il link di ${platform.name}`">
            <img v-if="logoUrl(platform)" :src="logoUrl(platform)" :alt="platform.name" class="platform-logo" />
            <span v-else class="platform-name">{{ platform.name }}</span>
        </button>
    </div>
</template>
