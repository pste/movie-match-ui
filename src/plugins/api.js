import logger from '@/plugins/logger';
import useErrorsStore from '@/stores/errors';
import useLoadingStore from '@/stores/loading';

// Percorso relativo sempre: in produzione /api lo instrada l'ingress, in
// sviluppo il proxy di Vite (vite.config.js).
const apiURL = '/api';

// L'API risponde agli errori con { detail }: una stringa per quelli sollevati
// dal codice, una lista per gli errori di validazione dei dati.
function errorMessage(data, status) {
    if (typeof data.detail === 'string') {
        return data.detail;
    }
    if (Array.isArray(data.detail)) {
        return 'Dati non validi';
    }
    return `Errore ${status}`;
}

// quiet: niente barra di caricamento e niente toast. Serve agli aggiornamenti
// in background, che girano ogni pochi secondi: un toast a ogni giro mentre
// l'API e' giu' non aggiunge informazione, la copre.
async function request(method, url, { body, quiet } = {}) {
    const loading = useLoadingStore();
    if (!quiet) {
        loading.start();
    }

    try {
        const res = await fetch(apiURL + url, {
            method,
            headers: body ? { 'Content-Type': 'application/json' } : undefined,
            body: body ? JSON.stringify(body) : undefined,
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            const err = new Error(errorMessage(data, res.status));
            err.status = res.status;
            throw err;
        }
        return data;
    }
    catch(err) {
        logger.error(`API ${method} ${url}`, err);
        if (!quiet) {
            useErrorsStore().push(err.message);
        }
        throw err;
    }
    finally {
        if (!quiet) {
            loading.stop();
        }
    }
}

export const api = {
    get: (url, options) => request('GET', url, options),
    post: (url, body) => request('POST', url, { body }),
    put: (url, body) => request('PUT', url, { body }),
    del: (url) => request('DELETE', url),
};

export default {
    install: (app) => {
        app.provide('API', api);
    }
}
