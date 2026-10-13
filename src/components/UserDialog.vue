<script setup>
import { ref, computed, watch } from 'vue';
import useUsersStore from '@/stores/users';

// Aggiunta (user = null) e modifica del nome di un utente.
const props = defineProps({
    user: { type: Object, default: null },
});

const visible = defineModel('visible', { type: Boolean, default: false });

const store = useUsersStore();

const name = ref('');
const busy = ref(false);

const isNew = computed(() => !props.user);

watch(visible, (open) => {
    if (open) {
        name.value = props.user?.name || '';
    }
});

// Si chiude solo se il salvataggio riesce: un nome gia' usato lascia il
// dialog aperto, e il motivo lo dice il toast di App.vue.
async function submit() {
    if (!name.value.trim()) {
        return;
    }
    busy.value = true;
    try {
        await store.save({ user_id: props.user?.user_id, name: name.value });
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
    <Dialog v-model:visible="visible" modal :header="isNew ? 'Nuovo utente' : 'Modifica utente'"
            class="movie-dialog" :draggable="false">
        <form id="user-form" class="movie-form" @submit.prevent="submit">
            <label for="user-name">Nome</label>
            <InputText id="user-name" v-model="name" maxlength="40" autofocus placeholder="Stefano" />
        </form>

        <template #footer>
            <Button label="Annulla" severity="secondary" text @click="visible = false" />
            <Button type="submit" form="user-form" :label="isNew ? 'Aggiungi' : 'Salva'" icon="pi pi-check"
                    :loading="busy" :disabled="!name.trim()" />
        </template>
    </Dialog>
</template>
