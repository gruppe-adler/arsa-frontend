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
import PageNotFound from '../views/PageNotFound.vue';

const routes = [
    { path: '/app/:pathMatch(.*)*', component: PageNotFound },
    { path: '/app/servers-list', component: ServersList },
    { path: '/app/add-server', component: AddServer },
    { path: '/app/ars-service', component: ArsService },
    { path: '/app/edit-server/:id', component: EditServer },
    { path: '/app/view-server/:id', component: ViewServer },
    { path: '/app/server-logs-list/:id', component: ServerLogsList },
    { path: '/app/server-stats/:id', component: ServerStats },
    { path: '/app/players-list/:id', component: PlayersList },
    { path: '/app/view-server-log/:id/:log/:file', component: ViewServerLog },
    { path: '/app/', redirect: '/app/servers-list' }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
