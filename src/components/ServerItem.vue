<script setup lang="ts">

import { onUnmounted, ref }  from 'vue'
import { useServersStore } from '../stores/servers'

const serversStore = useServersStore()

const props = defineProps({
  server: Object
})

const isRunning = ref(false)

const isRunningInterval = setInterval(() => {
    serversStore.isRunning(props.server?.uuid).then(result => isRunning.value = result);
}, 1000);

onUnmounted(() => clearInterval(isRunningInterval));

</script>

<template>
  <li>
    <button id="start-stop-button" type="button" @click="serversStore.stop(props.server?.uuid)" v-if="isRunning">Stop</button>
    <button id="start-stop-button" type="button" @click="serversStore.start(props.server?.uuid)" v-else>Start</button>
    <p>{{ props.server?.name }} ({{ props.server?.uuid }})</p>
  </li>
</template>

<style scoped>
</style>