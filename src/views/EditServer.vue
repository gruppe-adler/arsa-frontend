<script setup lang="ts">

import { computed, ref } from 'vue'
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

const inputViolationCounter = ref(0);

const disabled = computed<boolean>(() => (inputViolationCounter.value > 0) ? true : false );

function updateServer() {
  serversStore.update(server.value)
      .then(() => {
        router.push('/servers-list')
      });
}

</script>

<template>
  <div class="form-container">
    <h1>Edit Server</h1>
    <ConfigForm v-model:input-violation-counter="inputViolationCounter" v-model:server="server"/>
    <br/>
    <br/>
    <button type="button" :disabled @click="updateServer()">Update</button>
  </div>
</template>

<style scoped>
</style>