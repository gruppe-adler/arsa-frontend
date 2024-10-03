<script setup lang="ts">

import { useServersStore } from '../stores/servers'
import ServerItem from '../components/ServerItem.vue'
import { computed } from 'vue';
import { Server } from '../utils/interfaces';

const serversStore = useServersStore()

updateServerList();

function updateServerList() {
  serversStore.getAll()
    .then(() => serversStore.getPublicIp())
}

function onServerDeleted() {
  updateServerList();
}

function onServerCloned() {
  updateServerList();
}

const sortedServers = computed(() => {
  const clonedServers = Object.assign([], serversStore.servers) // clone array
  return clonedServers.sort((a: Server, b: Server) => (a.name < b.name) ? -1 : 1)
})

</script>

<template>
  <div>
    <h1>Servers List</h1>
    <ul id="servers-list">
      <ServerItem @server-deleted.once="onServerDeleted" @server-cloned.once="onServerCloned"
        v-for="item in sortedServers"
        :server="item"
      ></ServerItem>
    </ul>
  </div>
</template>

<style scoped>
#servers-list {
    list-style-type: none;
    padding: 0px;
}
</style>