<script setup>
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import useTheme from '@/composables/useTheme';

const router = useRouter();
const { isDark, toggle } = useTheme();

// Il menu sono le rotte con un titolo: una pagina nuova compare da sola.
const pages = router.getRoutes().filter((route) => route.meta.title);

// Il pulsante mostra il tema verso cui si va, non quello attuale.
const themeLabel = computed(() => (isDark.value ? 'Tema chiaro' : 'Tema scuro'));
</script>

<template>
    <header class="app-header">
        <div class="app-brand">
            <i class="pi pi-video" />
            <span>Movie Match</span>
        </div>
        <nav class="app-nav">
            <RouterLink v-for="page in pages" :key="page.name" :to="{ name: page.name }"
                        class="app-nav-link" active-class="app-nav-link-active">
                <i :class="page.meta.icon" />
                <span>{{ page.meta.title }}</span>
            </RouterLink>
        </nav>
        <Button :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'" severity="secondary" text rounded
                v-tooltip.bottom="themeLabel" :aria-label="themeLabel" @click="toggle" />
    </header>
</template>
