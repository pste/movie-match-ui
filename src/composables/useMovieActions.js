import { useConfirm } from 'primevue/useconfirm';
import useMoviesStore from '@/stores/movies';

// Azioni su un film usate sia dalla lista dei da vedere sia dalla tabella dei
// film scelti. Gli errori li mostra gia' App.vue come toast: qui si ignorano.
export default function useMovieActions() {
    const store = useMoviesStore();
    const confirm = useConfirm();

    function toggleWatched(movie) {
        store.setWatched(movie, !movie.watched).catch(() => {});
    }

    function askDelete(movie) {
        confirm.require({
            header: 'Eliminare il film?',
            message: `"${movie.title}" esce dalla lista.`,
            icon: 'pi pi-trash',
            acceptProps: { label: 'Elimina', severity: 'danger' },
            rejectProps: { label: 'Annulla', severity: 'secondary', text: true },
            accept: () => store.deleteMovie(movie).catch(() => {}),
        });
    }

    return { toggleWatched, askDelete };
}
