<script setup>
import { ref, watch } from 'vue';

// Locandina, o un segnaposto se manca o se l'URL non si carica: i poster sono
// link esterni inseriti a mano, e spariscono.
// lazy: dentro il Dialog di PrimeVue il caricamento lazy del browser non
// parte mai (verificato su Chromium: 0 locandine su 8 dopo 5 secondi), quindi
// li' va spento.
const props = defineProps({
    src: { type: String, default: null },
    size: { type: String, default: 'small' }, // 'small' | 'large'
    lazy: { type: Boolean, default: true },
});

const broken = ref(false);

watch(() => props.src, () => {
    broken.value = false;
});
</script>

<template>
    <img v-if="src && !broken" :src="src" alt="" :loading="lazy ? 'lazy' : 'eager'" referrerpolicy="no-referrer"
         :class="['poster', `poster-${size}`]" @error="broken = true" />
    <div v-else :class="['poster', 'poster-empty', `poster-${size}`]">
        <i class="pi pi-video" />
    </div>
</template>
