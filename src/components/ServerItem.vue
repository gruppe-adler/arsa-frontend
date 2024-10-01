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
  <li class="server-item">
    <p>
      <span class="column-left" v-if="isRunning">Online</span>
      <span class="column-left" v-else="isRunning">Offline</span>
      <button class="column-left" type="button" @click="serversStore.stop(props.server?.uuid)" v-if="isRunning">Stop</button>
      <button class="column-left" type="button" @click="serversStore.start(props.server?.uuid)" v-else>Start</button>
      <span class="column-center">{{ props.server?.name }} ({{ props.server?.uuid }})</span>
      <button class="column-right" type="button" @click="serversStore.delete(props.server?.uuid);$emit('serverDeleted')" :disabled="isRunning">Delete</button>
      <button class="column-right" type="button" @click="">Clone</button>
    </p>
  </li>
</template>

<style scoped>
  .server-item {
  }
  .column-left {
    margin-right: 10px;
  }
  .column-center {
  }
  .column-right {
    margin-left: 10px;
    float: right;
  }
</style>