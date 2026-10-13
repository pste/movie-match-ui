<script setup>
import { ref, onMounted } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import UserDialog from '@/components/UserDialog.vue';
import useUsersStore from '@/stores/users';

const store = useUsersStore();
const confirm = useConfirm();

const dialogVisible = ref(false);
const editing = ref(null);

// I conteggi cambiano a ogni film aggiunto o visto: entrando nella pagina si
// rileggono, invece di aspettare il giro periodico di App.vue.
onMounted(() => {
    store.load().catch(() => {});
});

function openDialog(user = null) {
    editing.value = user;
    dialogVisible.value = true;
}

// Un utente con dei film non si cancella: lo rifiuta l'API, e il motivo
// arriva come toast.
function askDelete(user) {
    confirm.require({
        header: 'Eliminare l\'utente?',
        message: `${user.name} non comparira' piu' fra chi propone i film.`,
        icon: 'pi pi-trash',
        acceptProps: { label: 'Elimina', severity: 'danger' },
        rejectProps: { label: 'Annulla', severity: 'secondary', text: true },
        accept: () => store.remove(user).catch(() => {}),
    });
}
</script>

<template>
    <main class="page">
        <Card>
            <template #title>
                <div class="movie-list-head">
                    <span>Utenti ({{ store.users.length }})</span>
                    <Button label="Aggiungi" icon="pi pi-plus" size="small" @click="openDialog()" />
                </div>
            </template>
            <template #subtitle>
                Ogni film candidato e' proposto da un utente. All'estrazione chi ha avuto meno film
                visti ha piu' probabilita' di uscire.
            </template>
            <template #content>
                <DataTable :value="store.users" data-key="user_id" size="small" striped-rows class="users-table">
                    <template #empty>
                        <p class="empty-state">Nessun utente: aggiungi chi guarda i film, es. "Stefano".</p>
                    </template>

                    <Column field="name" header="Nome" sortable />
                    <Column field="candidates" header="Film candidati" sortable />
                    <Column field="watched" header="Film visti" sortable />
                    <Column header="" class="col-actions">
                        <template #body="{ data }">
                            <Button icon="pi pi-pencil" severity="secondary" text rounded
                                    v-tooltip.top="'Rinomina'" aria-label="Rinomina" @click="openDialog(data)" />
                            <Button icon="pi pi-trash" severity="danger" text rounded
                                    v-tooltip.top="'Elimina'" aria-label="Elimina" @click="askDelete(data)" />
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>

        <UserDialog v-model:visible="dialogVisible" :user="editing" />
    </main>
</template>
