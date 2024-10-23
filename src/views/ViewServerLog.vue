<script setup lang="ts">

import { ref } from 'vue';

import { useRoute } from 'vue-router'

import { useServersStore } from '../stores/servers'

const route = useRoute();

const serversStore = useServersStore();

const serverLog = ref('')

refresh();

function refresh() {
  serversStore.getLog(route.params.id as string, 
        route.params.log as string, 
        route.params.file as string).then((log) => serverLog.value = log.replace(/\n/g, '<br>'))
}

async function importPlayers() {
  const importedPlayers = await serversStore.getPlayersFromLog(route.params.id as string, route.params.log as string);
  alert(`Imported ${importedPlayers.length} player(s) from log.`)
}

</script>

<template>
  <h1>View Server Log {{ route.params.log }}/{{ route.params.file }}</h1>
  <button type="button" @click="importPlayers()">Import Players</button>
  <p v-html="serverLog"></p>
  <button type="button" @click="refresh()">Refresh</button>
</template>

<style scoped>
</style>
