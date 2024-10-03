import { createWebHistory, createRouter } from 'vue-router'

import ServersList from '../views/ServersList.vue'
import AddServer from '../views/AddServer.vue'
import EditServer from '../views/EditServer.vue'
import ViewServer from '../views/ViewServer.vue'

const routes = [
  { path: '/servers-list', component: ServersList },
  { path: '/add-server', component: AddServer },
  { path: '/edit-server/:id', component: EditServer },
  { path: '/view-server/:id', component: ViewServer },
  { path: '/', redirect: '/servers-list' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router