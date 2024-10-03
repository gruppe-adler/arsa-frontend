<script setup lang="ts">

import { useServersStore } from '../stores/servers'
import ServerItem from '../components/ServerItem.vue'

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

</script>

<template>
  <div>
    <h1>Servers List</h1>
    <ul id="servers-list">
      <ServerItem @server-deleted.once="onServerDeleted" @server-cloned.once="onServerCloned"
        v-for="item in serversStore.servers"
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