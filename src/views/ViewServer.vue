<script setup lang="ts">

import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useServersStore } from '../stores/servers'
import { Server } from '../utils/interfaces'
import ConfigForm from '../components/ConfigForm.vue'
import { defaultServer } from '../utils/defaults'

const route = useRoute()

const serversStore = useServersStore()

const server = ref<Server>(defaultServer)
const result = serversStore.servers.find(i => i.uuid === route.params.id)
if (result) server.value = result;

</script>

<template>
  <h1>View Server</h1>
  <ConfigForm
    readonly
    v-model:name="server.name" v-model:config="server.config"/>
</template>

<style scoped>
</style>