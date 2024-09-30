import { createWebHistory, createRouter } from 'vue-router'

import AddServer from '../views/AddServer.vue'
import ServersList from '../views/ServersList.vue'

const routes = [
  { path: '/servers-list', component: ServersList },
  { path: '/add-server', component: AddServer },
  { path: '/edit-server/:id', component: AddServer },
  { path: '/', redirect: '/servers-list' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router