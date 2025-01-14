<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useServersStore } from '../stores/servers';
import { Server } from '../utils/interfaces';
import { Copy, Trash2, UsersRound, ScrollText, ChartColumn } from 'lucide-vue-next';

const model = defineModel<Server>();
const emit = defineEmits(['serverDeleted', 'serverCloned']);

const router = useRouter();
const serversStore = useServersStore();

function onClickDelete() {
  if (confirm('Do you really want to delete this server?')) {
    serversStore.delete(model.value!.uuid).then(() => {
      emit('serverDeleted');
    });
  }
}

function onClickClone() {
  const server: Server = { ...model.value! };
  server.name = `${server.name} Duplicate`;
  server.uuid = '';
  serversStore.add(server).then(() => {
    emit('serverCloned');
  });
}

function onClickLogs() {
  router.push(`/server-logs-list/${model.value!.uuid}`);
}

function onClickStats() {
  router.push(`/server-stats/${model.value!.uuid}`);
}

function onClickKnownPlayers() {
  router.push(`/players-list/${model.value!.uuid}`);
}
</script>

<template>
  <li class="serveritem">
    <div class="server-status">
      <span v-if="model!.isRunning" class="status-indicator online">{{ model!.config.bindPort }}</span>
      <span v-else class="status-indicator offline">{{ model!.config.bindPort }}</span>
      <button 
        class="status-button stop-button" 
        v-if="model!.isRunning" 
        @click="serversStore.stop(model!.uuid)">
        Stop
      </button>
      <button 
        class="status-button start-button" 
        v-else 
        @click="serversStore.start(model!.uuid)">
        Start
      </button>
    </div>

    <div class="server-info">
      <span class="port"></span>
      <div>
        <RouterLink :to="`/edit-server/${model!.uuid}`" v-if="!model!.isRunning" class="server-link">
          {{ model!.name }}
        </RouterLink>
        <RouterLink :to="`/view-server/${model!.uuid}`" v-else class="server-link">
          {{ model!.name }}
        </RouterLink>
      </div>
      <span class="serverid">({{ model!.uuid }})</span>
    </div>
      <div class="cluster-right">
        <button class="action-button" @click="onClickKnownPlayers">
          <UsersRound size="16" />Players
        </button>
        <button @click="onClickLogs" class="action-button">
          <ScrollText size="16" />Logs
        </button>
        <button @click="onClickStats" :disabled="!model!.isRunning" class="action-button">
          <ChartColumn size="16" />Stats
        </button>
        <button @click="onClickClone" class="action-button">
          <Copy size="16" />
        </button>
        <button @click="onClickDelete" :disabled="model!.isRunning" class="action-button delete-button">
          <Trash2 size="16" />
        </button>
      </div>
  </li>
</template>

<style scoped>
.serveritem {
  display: flex;
  flex-direction: row;
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.server-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.status-indicator {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: bold;
}

.online {
  color: #fff;
  background-color: #4caf50;
}

.offline {
  color: #fff;
  background-color: #f44336;
}

.status-button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.stop-button {
  background-color: rgba(244, 67, 54, 0.8);
  color: #fff;
}

.stop-button:hover {
  background-color: rgba(244, 67, 54, 1);
}

.server-info {
  display: flex;
  width: 70%;
  flex-direction: column;
  margin-bottom: 0.5rem;
  margin-left: 0.5rem;
}

.server-link {
  text-decoration: none;
  color: #007bff;
  font-weight: bold;
  font-size: 1.2rem;
}

.server-link:hover {
  text-decoration: underline;
}

.serverid {
  color: #aaa;
  font-size: 0.8rem;
  margin-top: 0.2rem;
}

.cluster-right {
  width: 70%;
  display: flex;
  flex-direction: row;
  justify-content:right;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.serveritem:hover .cluster-right {
  opacity: 1;
}

.cluster-left,
.cluster-right {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  padding: 0.2rem .5rem;
  font-size: 0.875rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  background-color: #e0e0e0;
  color: #000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 4rem;
  justify-content: center; 
}

.action-button:hover {
  background-color: #d6d6d6;
}

.delete-button:hover:not(:disabled) {
  background-color: #d32f2f;
}

</style>
