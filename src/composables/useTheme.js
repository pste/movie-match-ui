import { ref, watch } from 'vue';

// PrimeVue e' configurato con darkModeSelector: '.dark-mode' (src/plugins/index.js):
// tutto il tema, e tutte le variabili --p-* usate in style.css, cambiano insieme
// a questa singola classe sull'elemento <html>.
const STORAGE_KEY = 'movie-match.theme';

// localStorage puo' mancare o lanciare (navigazione privata, dati bloccati):
// in quel caso vale il default e la scelta dura finche' la scheda e' aperta.
function readTheme() {
    try {
        return localStorage.getItem(STORAGE_KEY);
    }
    catch {
        return null;
    }
}

function writeTheme(value) {
    try {
        localStorage.setItem(STORAGE_KEY, value);
    }
    catch {
        // vedi readTheme
    }
}

// Scuro di default: la scelta dell'utente, se c'e', vince sempre.
const isDark = ref(readTheme() !== 'light');

// Lo stato vive nel modulo, non dentro la funzione: il tema e' uno solo per
// tutta l'applicazione, e questa riga viene eseguita al primo import, cioe'
// prima del mount. Cosi' la pagina non lampeggia in chiaro prima di diventare
// scura.
applyToDocument();

watch(isDark, () => {
    applyToDocument();
    writeTheme(isDark.value ? 'dark' : 'light');
});

function applyToDocument() {
    document.documentElement.classList.toggle('dark-mode', isDark.value);
}

export default function useTheme() {
    function toggle() {
        isDark.value = !isDark.value;
    }

    return { isDark, toggle };
}
