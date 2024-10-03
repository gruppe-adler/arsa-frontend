<script setup lang="ts">

import { computed } from 'vue';

import { useServersStore } from '../stores/servers'
import { useLogsStore } from '../stores/logs'
import ServerItem from '../components/ServerItem.vue'
import { Server } from '../utils/interfaces';

const serversStore = useServersStore()
const logsStore = useLogsStore()

serversStore.getPublicIp().then(() => {})
updateServerList();

function updateServerList() {
  serversStore.getAll().then(() => {})
}

function onServerDeleted() {
  updateServerList();
}

function onServerCloned() {
  updateServerList();
}

const sortedServers = computed(() => {
  const clonedServers = Object.assign([], serversStore.servers) // clone array
  return clonedServers.sort((a: Server, b: Server) => (a.name <  b.name) ? -1 : 1)
})

</script>

<template>
  <div>
    <h1>Arma Reforger Servers List</h1>
    <ul id="servers-list">
      <ServerItem @server-deleted.once="onServerDeleted" @server-cloned.once="onServerCloned"
        v-for="item in sortedServers"
        :server="item"
      ></ServerItem>
    </ul>
    <h1>Host Server Log</h1>
    <ul id="logs">
      <li v-for="logEntry in logsStore.logs">{{ logEntry }}</li>
    </ul>
  </div>
</template>

<style scoped>
#servers-list {
    list-style-type: none;
    padding: 0px;
}
#logs {
  list-style-type: none;
  padding: 0px;
}
</style>