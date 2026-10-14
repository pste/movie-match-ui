import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/plugins/api';
import useMoviesStore from '@/stores/movies';

// Gli utenti: solo nomi, con quanti film hanno in gara e quanti gia' visti.
const useUsersStore = defineStore('users', () => {
    const users = ref([]);

    // Le opzioni per i Select di PrimeVue.
    const options = computed(() => users.value.map((user) => ({ label: user.name, value: user.user_id })));

    async function load(quiet = false) {
        users.value = await api.get('/users', { quiet });
    }

    // Rinominare cambia il nome mostrato sui film: si ricaricano anche quelli.
    async function save(user) {
        if (user.user_id) {
            await api.put(`/users/${user.user_id}`, { name: user.name });
            await useMoviesStore().load();
        }
        else {
            await api.post('/users', { name: user.name });
        }
        await load();
    }

    async function remove(user) {
        await api.del(`/users/${user.user_id}`);
        await load();
    }

    return { users, options, load, save, remove };
});

export default useUsersStore;
