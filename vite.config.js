import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
// auto import dei componenti PrimeVue (i componenti locali NON sono auto-importati)
import Components from 'unplugin-vue-components/vite';
import { PrimeVueResolver } from '@primevue/auto-import-resolver';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());

    return {
        server: {
            host: 'localhost',
            port: 5173,
            // In sviluppo /api va all'API sul PC, come in produzione lo
            // instrada l'ingress: stesso host, quindi niente CORS ne' URL
            // assoluti nel codice.
            proxy: {
                '/api': env.VITE_API_PROXY || 'http://localhost:8000',
            },
        },
        plugins: [
            vue(),
            Components({
                resolvers: [
                    PrimeVueResolver()
                ]
            }),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        }
    };
})
