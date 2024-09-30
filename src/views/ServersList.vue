<script setup lang="ts">

import { onMounted, computed } from 'vue'
import { useServersStore } from '../stores/servers'
import ServerItem from '../components/ServerItem.vue'

const serversStore = useServersStore()

serversStore.getAll()
  .then(() => console.log(serversStore.servers))

</script>

<template>
  <div id="servers-list">
    <h1 id="servers-list-head">Servers List</h1>
    <ul id="servers-list-list">
      <ServerItem
        v-for="item in serversStore.servers"
        :server="item"
      ></ServerItem>
    </ul>
  </div>
</template>

<style scoped>
#servers-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr;
    justify-items: stretch;
}

#servers-list-head {
    grid-column: 1 / span 2;
    grid-row: 1;
}

#article-list-list {
    list-style-type: none;

    grid-column: 1 / span 1;
    grid-row: 2;
}
</style>