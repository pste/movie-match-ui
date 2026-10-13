import pinia from './pinia';
import router from './router';
import api from './api';
import ToastService from './toast';
import ConfirmationService from './confirm';
//
import PrimeVue from 'primevue/config';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import Tooltip from 'primevue/tooltip';
import Aura from '@primevue/themes/aura';
import { definePreset } from '@primevue/themes';

// Aura con l'ambra al posto del verde: il colore delle luci di sala.
const MovieMatchPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{amber.50}',
            100: '{amber.100}',
            200: '{amber.200}',
            300: '{amber.300}',
            400: '{amber.400}',
            500: '{amber.500}',
            600: '{amber.600}',
            700: '{amber.700}',
            800: '{amber.800}',
            900: '{amber.900}',
            950: '{amber.950}',
        },
    },
});

export function registerPlugins(app) {
    app.use(pinia);

    // Scuro di default, con la classe .dark-mode su <html> gestita da
    // composables/useTheme.js (pulsante nell'header per passare al chiaro).
    app.use(PrimeVue, {
        theme: {
            preset: MovieMatchPreset,
            options: {
                darkModeSelector: '.dark-mode',
            }
        }
    });
    app.directive('tooltip', Tooltip);
    app.use(ToastService);
    app.use(ConfirmationService);

    app.use(router); // dopo pinia
    app.use(api);
}
