<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useServersStore } from '../stores/servers';
import { ArsStatus, Server } from '../utils/interfaces';

const model = defineModel<Server>();
const emit = defineEmits(['serverDeleted', 'serverCloned']);
const router = useRouter();
const serversStore = useServersStore();

const copyState = ref<'idle' | 'copied'>('idle');
let copyTimer: ReturnType<typeof setTimeout>;

async function copyUuid() {
    const uuid = model.value!.uuid;
    try { await navigator.clipboard.writeText(uuid); } catch {}
    copyState.value = 'copied';
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copyState.value = 'idle'; }, 1400);
}

function onClickDelete() {
    if (confirm('Do you really want to delete this server?')) {
        serversStore.delete(model.value!.uuid).then(() => emit('serverDeleted'));
    }
}
function onClickClone() {
    const server: Server = { ...model.value! };
    server.name = server.name.concat(' Duplicate');
    server.uuid = '';
    serversStore.add(server).then(() => emit('serverCloned'));
}
function serverRoute(tab?: string) {
    const base = model.value!.isRunning ? `/view-server/${model.value!.uuid}` : `/edit-server/${model.value!.uuid}`;
    return tab ? `${base}?tab=${tab}` : base;
}

function onClickLogs()    { router.push(serverRoute('logs')); }
function onClickSize()    { router.push(serverRoute('size')); }
function onClickStats()   { router.push(serverRoute('stats')); }
function onClickPlayers() { router.push(serverRoute('players')); }
function onClickName()    { router.push(serverRoute()); }

const shortUuid = (uuid: string) => uuid.slice(0, 8);
const arsAvailable = () => serversStore.arsStatus === ArsStatus.AVAILABLE;
</script>

<template>
  <div class="server-row">
    <!-- status -->
    <div class="server-status" :class="{ online: model!.isRunning }">
      <span class="dot" :class="model!.isRunning ? 'green' : ''"></span>
      <span>{{ model!.isRunning ? 'Online' : 'Offline' }}</span>
    </div>

    <!-- meta -->
    <div class="server-meta">
      <a class="server-name" @click="onClickName">{{ model!.name }}</a>
      <div class="server-info">
        <span class="port-tag">:{{ model!.config.bindPort }}</span>
        <button
          class="id-chip"
          :class="{ copied: copyState === 'copied' }"
          :title="copyState === 'copied' ? 'Copied!' : 'Click to copy UUID'"
          @click.stop="copyUuid"
        >
          <span class="id-label">{{ shortUuid(model!.uuid) }}</span>
          <svg v-if="copyState === 'idle'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>
        </button>
      </div>
    </div>

    <!-- actions -->
    <div class="server-actions">
      <button
        v-if="model!.isRunning"
        class="btn btn-stop"
        :disabled="!arsAvailable()"
        @click="serversStore.stop(model!.uuid)"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="1"/></svg>
        Stop
      </button>
      <button
        v-else
        class="btn btn-start"
        :disabled="!arsAvailable()"
        @click="serversStore.start(model!.uuid)"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l16 8-16 8z"/></svg>
        Start
      </button>

      <span class="divider-v"></span>

      <button class="btn btn-ghost" @click="onClickPlayers">Players</button>
      <button class="btn btn-ghost" :disabled="!model!.isRunning" @click="onClickStats">Stats</button>
      <button class="btn btn-ghost" @click="onClickSize">Size</button>
      <button class="btn btn-ghost" @click="onClickLogs">Logs</button>
      <button class="btn btn-ghost" @click="onClickClone">Clone</button>
      <button class="btn btn-ghost btn-danger" :disabled="model!.isRunning" @click="onClickDelete">Delete</button>
    </div>
  </div>
</template>

<style scoped>
.server-row {
  display: grid;
  grid-template-columns: 110px 1fr auto;
  align-items: center;
  gap: 24px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--line);
}
.server-row:last-child { border-bottom: none; }
.server-row:hover { background: var(--bg-soft); }

.server-status {
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; color: var(--ink-2); font-weight: 500;
}
.server-status.online { color: var(--ink); }

.server-meta { min-width: 0; }
.server-name {
  font-size: 15px; font-weight: 600;
  color: var(--ink); letter-spacing: -0.01em;
  text-decoration: none; cursor: pointer;
  display: inline-block;
}
.server-name:hover { color: var(--indigo); }

.server-info {
  margin-top: 4px;
  display: flex; gap: 14px; align-items: center;
  font-size: 12px; color: var(--ink-3);
}

.server-actions { display: flex; gap: 4px; align-items: center; }
.server-actions .btn { padding: 6px 10px; font-size: 12.5px; }

.divider-v { width: 1px; height: 18px; background: var(--line); margin: 0 4px; }
</style>
