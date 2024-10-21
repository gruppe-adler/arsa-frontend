<script setup lang="ts">

import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useServersStore } from '../stores/servers'
import { Server } from '../utils/interfaces'
import ConfigForm from '../components/ConfigForm.vue'
import { defaultServer } from '../utils/defaults'

const route = useRoute()

const inputViolationCounter = ref(0);

const serversStore = useServersStore()

const server = ref<Server>(defaultServer)

serversStore.getAll().then(() => {
    const result = serversStore.servers.find(i => i.uuid === route.params.id)
    if (result) server.value = result;
});

</script>

<template>
    <div class="form-container">
        <h1>View Server</h1>
        <ConfigForm readonly v-model:input-violation-counter="inputViolationCounter" v-model:server="server" />
    </div>
</template>

<style scoped></style>