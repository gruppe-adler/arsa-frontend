<script setup lang="ts">

import { onUnmounted, ref }  from 'vue'
import { useServersStore } from '../stores/servers'
import { Server } from '../utils/interfaces';
import { defaultServer } from '../utils/defaults';

const serversStore = useServersStore()

const props = defineProps({ server: Object })

const emit = defineEmits(['serverDeleted', 'serverCloned'])

const isRunning = ref(false)

const isRunningInterval = setInterval(() => {
    serversStore.isRunning(props.server?.uuid).then(result => isRunning.value = result);
}, 1000);

onUnmounted(() => clearInterval(isRunningInterval));

function onClickDelete() {
  if(confirm('Do you really want to delete this server?')) {
    serversStore.delete(props.server?.uuid).then(() => {
      emit('serverDeleted');
    });
  }
}

function onClickClone() {
  const server: Server = props.server as Server || defaultServer;
  server.name = server.name.concat(' Duplicate');
  serversStore.add(server).then(() => {
    delete(props.server?.uuid);
    emit('serverCloned');
  });
}

</script>

<template>
  <li>
    <p>
      <span class="column-left" v-if="isRunning">Online</span>
      <span class="column-left" v-else="isRunning">Offline</span>
      <button class="column-left" type="button" @click="serversStore.stop(props.server?.uuid)" v-if="isRunning">Stop</button>
      <button class="column-left" type="button" @click="serversStore.start(props.server?.uuid)" v-else>Start</button>
      <RouterLink :to="`/edit-server/${props.server?.uuid}`">{{ props.server?.name }}</RouterLink>
      <span> ({{ props.server?.uuid }})</span>
      <button class="column-right" type="button" @click="onClickDelete" :disabled="isRunning">Delete</button>
      <button class="column-right" type="button" @click="onClickClone">Clone</button>
    </p>
  </li>
</template>

<style scoped>
  .column-left {
    margin-right: 10px;
  }
  .column-right {
    margin-left: 10px;
    float: right;
  }
</style>