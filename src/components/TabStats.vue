<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import { useServersStore } from '../stores/servers';
import { type DockerStats } from '../utils/interfaces';

const props = defineProps<{ serverId: string }>();

const serversStore = useServersStore();
const loading = ref(true);
const stats = ref<DockerStats | null>(null);
const timestamp = ref('');
const autoUpdateRunning = ref(false);
let intervalId = 0;

async function updateStats() {
    const result = await serversStore.getStats(props.serverId);
    if (result) { timestamp.value = new Date().toLocaleTimeString(); stats.value = result; }
    loading.value = false;
}

function startAutoUpdate() {
    intervalId = setInterval(updateStats, 5_000);
    autoUpdateRunning.value = true;
}
function stopAutoUpdate() {
    clearInterval(intervalId);
    autoUpdateRunning.value = false;
}

watch(() => props.serverId, () => { loading.value = true; updateStats(); }, { immediate: true });
onBeforeUnmount(() => { if (autoUpdateRunning.value) clearInterval(intervalId); });

const rows = [
    { key: 'CPUPerc',  label: 'CPU' },
    { key: 'MemUsage', label: 'Memory usage' },
    { key: 'MemPerc',  label: 'Memory %' },
    { key: 'NetIO',    label: 'Network I/O' },
    { key: 'BlockIO',  label: 'Block I/O' },
    { key: 'PIDs',     label: 'PIDs' },
    { key: 'Name',     label: 'Container name' },
    { key: 'ID',       label: 'Container ID' },
] as const;
</script>

<template>
  <div class="tab-loading" v-if="loading">Loading…</div>
  <template v-else>
    <div class="tab-actions">
      <span class="timestamp" v-if="timestamp">Last updated {{ timestamp }}</span>
      <span class="stretch"></span>
      <button class="btn" @click="updateStats">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6"/></svg>
        Refresh
      </button>
      <button class="btn btn-stop" v-if="autoUpdateRunning" @click="stopAutoUpdate">Stop auto-update</button>
      <button class="btn btn-start" v-else @click="startAutoUpdate">Auto-update</button>
    </div>

    <div class="data-table" v-if="stats">
      <div class="table-row" v-for="row in rows" :key="row.key">
        <span class="stat-label">{{ row.label }}</span>
        <span class="mono stat-value">{{ stats[row.key] ?? '—' }}</span>
      </div>
    </div>
    <div class="empty-box" v-else>No stats available. Server may be offline.</div>
  </template>
</template>

<style scoped>
.tab-loading { color: var(--ink-3); font-size: 13px; padding: 24px 0; }

.tab-actions {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 20px;
}
.timestamp { font-size: 12.5px; color: var(--ink-3); }

.data-table {
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--bg);
}
.table-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;
  padding: 14px 24px;
  border-bottom: 1px solid var(--line);
  font-size: 13.5px;
  align-items: center;
}
.table-row:last-child { border-bottom: none; }
.stat-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
  color: var(--ink-3);
}
.stat-value { color: var(--ink); font-size: 13px; }

.empty-box {
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 40px 24px;
  text-align: center;
  color: var(--ink-3);
  font-size: 14px;
  background: var(--bg);
}
</style>
