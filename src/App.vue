<script setup>
import { onMounted, watch } from 'vue';
import { RouterView } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import { useToast } from 'primevue/usetoast';
import usePolling from '@/composables/usePolling';
import useErrorsStore from '@/stores/errors';
import useLoadingStore from '@/stores/loading';
import useMoviesStore from '@/stores/movies';
import useUsersStore from '@/stores/users';

const errors = useErrorsStore();
const loading = useLoadingStore();
const movies = useMoviesStore();
const users = useUsersStore();
const toast = useToast();

// Gli errori delle chiamate API diventano toast in un posto solo: nessun
// componente deve occuparsi di come si segnala un errore.
watch(() => errors.last, (err) => {
    if (err) {
        toast.add({ severity: 'error', summary: 'Errore', detail: err.message, life: 5000 });
    }
});

// Film e utenti servono a tutte le pagine: si caricano qui, una volta, e
// restano in memoria passando da una pagina all'altra. L'aggiornamento
// periodico fa vedere le modifiche fatte da altri dispositivi; i suoi errori
// si ignorano, il giro dopo ritenta.
function loadAll(quiet) {
    return Promise.all([movies.load(quiet), users.load(quiet)]).catch(() => {});
}

onMounted(() => {
    loadAll(false);
});

usePolling(() => loadAll(true), 15000);
</script>

<template>
    <ProgressBar v-if="loading.isLoading" mode="indeterminate" class="app-progress" />
    <AppHeader />
    <RouterView />
    <Toast position="bottom-center" />
    <ConfirmDialog />
</template>
