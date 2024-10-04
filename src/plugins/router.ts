import { createWebHistory, createRouter } from 'vue-router'

import ServersList from '../views/ServersList.vue'
import AddServer from '../views/AddServer.vue'
import EditServer from '../views/EditServer.vue'
import ViewServer from '../views/ViewServer.vue'
import ServerLogsList from '../views/ServerLogsList.vue'
import ViewServerLog from '../views/ViewServerLog.vue'

const routes = [
  { path: '/servers-list', component: ServersList },
  { path: '/add-server', component: AddServer },
  { path: '/edit-server/:id', component: EditServer },
  { path: '/view-server/:id', component: ViewServer },
  { path: '/server-logs-list/:id', component: ServerLogsList },
  { path: '/view-server-log/:id/:log/:file', component: ViewServerLog },
  { path: '/', redirect: '/servers-list' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router