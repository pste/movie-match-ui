<script setup>
import { ref, watch } from 'vue';
import useMoviesStore from '@/stores/movies';
import useUsersStore from '@/stores/users';

// Modifica dei campi nostri di un film: note e chi lo propone. Titolo, anno,
// locandina e regista vengono da IMDb e non si toccano; il genere non si
// modifica piu' da qui (lo conserva store.updateMovie).
const props = defineProps({
    movie: { type: Object, default: null },
});

const visible = defineModel('visible', { type: Boolean, default: false });

const store = useMoviesStore();
const users = useUsersStore();

const notes = ref('');
const userId = ref(null);
const busy = ref(false);

watch(visible, (open) => {
    if (open && props.movie) {
        notes.value = props.movie.notes || '';
        userId.value = props.movie.user_id;
    }
});

// Si chiude solo se il salvataggio riesce: altrimenti resta aperto con i dati
// inseriti, e l'errore lo mostra il toast di App.vue.
async function submit() {
    busy.value = true;
    try {
        await store.updateMovie(props.movie, { notes: notes.value, userId: userId.value });
        visible.value = false;
    }
    catch {
        // vedi sopra
    }
    finally {
        busy.value = false;
    }
}
</script>

<template>
    <Dialog v-model:visible="visible" modal :header="movie?.title" class="movie-dialog" :draggable="false">
        <form id="movie-form" class="movie-form" @submit.prevent="submit">
            <label for="movie-user">Proposto da</label>
            <Select v-model="userId" input-id="movie-user" :options="users.options" option-label="label"
                    option-value="value" placeholder="Nessuno" show-clear />

            <label for="movie-notes">Note</label>
            <Textarea id="movie-notes" v-model="notes" maxlength="500" rows="3" auto-resize autofocus />
        </form>

        <template #footer>
            <Button label="Annulla" severity="secondary" text @click="visible = false" />
            <Button type="submit" form="movie-form" label="Salva" icon="pi pi-check" :loading="busy" />
        </template>
    </Dialog>
</template>
