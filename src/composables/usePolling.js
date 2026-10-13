import { onMounted, onUnmounted } from 'vue';

// Richiama callback ogni intervalMs finche' il componente e' montato, cosi' si
// vedono i film aggiunti e le estrazioni fatte da altri dispositivi.
// A scheda nascosta si ferma, e al ritorno aggiorna subito: inutile
// interrogare l'API per una pagina che nessuno guarda.
export default function usePolling(callback, intervalMs) {
    let timer = null;

    function start() {
        stop();
        timer = setInterval(callback, intervalMs);
    }

    function stop() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    function onVisibility() {
        if (document.hidden) {
            stop();
        }
        else {
            callback();
            start();
        }
    }

    onMounted(() => {
        start();
        document.addEventListener('visibilitychange', onVisibility);
    });

    onUnmounted(() => {
        stop();
        document.removeEventListener('visibilitychange', onVisibility);
    });
}
