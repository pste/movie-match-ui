import { createRouter, createWebHistory } from 'vue-router';

import HomeView from '@/pages/Home.vue';
import WatchedView from '@/pages/Watched.vue';
import UsersView from '@/pages/Users.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        // title: la voce nel menu dell'header (AppHeader.vue).
        { path: '/', name: 'home', component: HomeView, meta: { title: 'Home', icon: 'pi pi-sparkles' } },
        { path: '/visti', name: 'watched', component: WatchedView, meta: { title: 'Visti', icon: 'pi pi-check-circle' } },
        { path: '/utenti', name: 'users', component: UsersView, meta: { title: 'Utenti', icon: 'pi pi-users' } },
        { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
    ],
});

export default router;
