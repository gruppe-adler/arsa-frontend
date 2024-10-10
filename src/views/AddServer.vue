<script setup lang="ts">

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useServersStore } from '../stores/servers'
import { Server } from '../utils/interfaces'
import ConfigForm from '../components/ConfigForm.vue'
import { defaultServer } from '../utils/defaults'

const router = useRouter()

const serversStore = useServersStore()

// I need to clone the defaultServer const object. Otherwise it's changed by the form.
// I don't know why this ref thing does that. Perhaps objects are always just references.
const server = ref<Server>(Object.assign({}, defaultServer))

function addServer() {
  if(!server.value.name) return alert('Field \'name\' is required.');
  if(!server.value.config.publicAddress) return alert('Field \'publicAddress\' is required.');
  if(!server.value.config.a2s.address) return alert('Field \'a2sAddress\' is required.');
  if(!server.value.config.rcon.address) return alert('Field \'rconAddress\' is required.');

  serversStore.add(server.value)
      .then(() => {
        router.push('/servers-list')
      })
}

function missionHeaderChanged(value: string) {
    server.value.config.game.gameProperties.missionHeader = JSON.parse(value);
}

function disableNavmeshStreamingChanged(value: string) {
    (value) ? server.value.config.operating.disableNavmeshStreaming = [] : server.value.config.operating.disableNavmeshStreaming = undefined;
}

</script>

<template>
  <h1>Add Server</h1>
  <ConfigForm
    @missionHeaderChanged="missionHeaderChanged"
    @disableNavmeshStreamingChanged="disableNavmeshStreamingChanged"
    v-model:name="server.name" v-model:config="server.config"/>
  <br/>
  <br/>
  <button type="button" @click="addServer()">Add</button>
</template>

<style scoped>
</style>