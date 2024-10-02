<script setup lang="ts">

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useServersStore } from '../stores/servers'
import { Server, ServerConfig } from '../utils/interfaces'
import ConfigForm from '../components/ConfigForm.vue'
import { defaultConfig } from '../utils/defaults'

const router = useRouter()

const serversStore = useServersStore()

const name = ref('')

const config = ref<ServerConfig>(defaultConfig)


function addServer() {
  if(!name.value) return alert('Field \'name\' is required.');
  if(!config.value.publicAddress) return alert('Field \'publicAddress\' is required.');
  if(!config.value.a2s.address) return alert('Field \'a2sAddress\' is required.');
  if(!config.value.rcon.address) return alert('Field \'rconAddress\' is required.');

  const server: Server = {
    uuid: '',
    name: name.value,
    config: config.value
  }

  serversStore.add(server)
      .then(() => {
        router.push('/servers-list')
      })
}

</script>

<template>
  <h1>Add Server</h1>
  <ConfigForm v-model:name="name" v-model:config="config"/>
  <br/>
  <br/>
  <button id="add-button" type="button" @click="addServer()">Add</button>
</template>

<style scoped>
</style>