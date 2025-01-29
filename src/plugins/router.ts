import { createWebHistory, createRouter } from 'vue-router';

import ServersList from '../views/ServersList.vue';
import AddServer from '../views/AddServer.vue';
import EditServer from '../views/EditServer.vue';
import ArsService from '../views/ArsService.vue';
import ViewServer from '../views/ViewServer.vue';
import ServerLogsList from '../views/ServerLogsList.vue';
import ViewServerLog from '../views/ViewServerLog.vue';
import PlayersList from '../views/PlayersList.vue';
import ServerStats from '../views/ServerStats.vue';
import ServerSize from '../views/ServerSize.vue';
import PageNotFound from '../views/PageNotFound.vue';

const routes = [
    { path: '/:pathMatch(.*)*', component: PageNotFound },
    { path: '/servers-list', component: ServersList },
    { path: '/add-server', component: AddServer },
    { path: '/ars-service', component: ArsService },
    { path: '/edit-server/:id', component: EditServer },
    { path: '/view-server/:id', component: ViewServer },
    { path: '/server-logs-list/:id', component: ServerLogsList },
    { path: '/server-stats/:id', component: ServerStats },
    { path: '/server-size/:id', component: ServerSize },
    { path: '/players-list/:id', component: PlayersList },
    { path: '/view-server-log/:id/:log/:file', component: ViewServerLog },
    { path: '/', redirect: '/servers-list' }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
