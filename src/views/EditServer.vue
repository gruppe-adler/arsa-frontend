<script setup lang="ts">

import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useServersStore } from '../stores/servers'
import { Server } from '../utils/interfaces'
import ConfigForm from '../components/ConfigForm.vue'
import { defaultServer } from '../utils/defaults'

const router = useRouter()
const route = useRoute()

const serversStore = useServersStore()

const server = ref<Server>(defaultServer)
const result = serversStore.servers.find(i => i.uuid === route.params.id)
if (result) server.value = result;

function updateServer() {
/*   if(!name.value) return alert('Field \'name\' is required.');
  if(!config.value.publicAddress) return alert('Field \'publicAddress\' is required.');
  if(!config.value.a2s.address) return alert('Field \'a2sAddress\' is required.');
  if(!config.value.rcon.address) return alert('Field \'rconAddress\' is required.'); */

  serversStore.update(server.value)
      .then(() => {
        router.push('/servers-list')
      })
}

</script>

<template>
  <h1>Edit Server</h1>
  <ConfigForm v-model:name="server.name" v-model:config="server.config"/>
  <br/>
  <br/>
  <button type="button" @click="updateServer()">Update</button>
</template>

<style scoped>
</style>