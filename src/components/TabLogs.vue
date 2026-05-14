<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useServersStore } from '../stores/servers';
import { ResultLogs, Log } from '../utils/interfaces';

const props = defineProps<{ serverId: string }>();

const serversStore = useServersStore();
const loading = ref(true);
const serverLogs = ref<ResultLogs>({ success: false, logs: [], containsCrashReportsLog: false });

async function load() {
    loading.value = true;
    const logs = await serversStore.getLogs(props.serverId);
    if (logs) serverLogs.value = logs;
    loading.value = false;
}

watch(() => props.serverId, load, { immediate: true });

const sorted = computed(() =>
    ([...serverLogs.value.logs] as Log[]).sort((a, b) => a.dir < b.dir ? -1 : 1)
);

function onDelete(logName: string) {
    serversStore.deleteLog(props.serverId, logName).then(load);
}
</script>

<template>
  <div class="tab-loading" v-if="loading">Loading…</div>
  <template v-else>
    <div class="logs-table" v-if="sorted.length > 0 || serverLogs.containsCrashReportsLog">
      <div class="log-row" v-if="serverLogs.containsCrashReportsLog">
        <span class="mono log-dir">CrashReports.log</span>
        <div class="log-links">
          <RouterLink class="log-link" :to="`/view-crash-reports-log/${props.serverId}`">View</RouterLink>
        </div>
        <div></div>
      </div>
      <div class="log-row" v-for="log in sorted" :key="log.dir">
        <span class="mono log-dir">{{ log.dir }}</span>
        <div class="log-links">
          <RouterLink class="log-link" :to="`/view-server-log/${props.serverId}/${log.dir}/console.log`" v-if="log.containsConsoleLog">console.log</RouterLink>
          <RouterLink class="log-link" :to="`/view-server-log/${props.serverId}/${log.dir}/error.log`"   v-if="log.containsErrorLog">error.log</RouterLink>
          <RouterLink class="log-link" :to="`/view-server-log/${props.serverId}/${log.dir}/script.log`"  v-if="log.containsScriptLog">script.log</RouterLink>
          <RouterLink class="log-link" :to="`/view-server-log/${props.serverId}/${log.dir}/crash.log`"   v-if="log.containsCrashLog">crash.log</RouterLink>
        </div>
        <div class="log-actions">
          <button class="btn btn-ghost btn-danger" type="button" @click="onDelete(log.dir)">Delete</button>
        </div>
      </div>
    </div>
    <div class="empty-box" v-else>No log entries found.</div>
  </template>
</template>

<style scoped>
.tab-loading { color: var(--ink-3); font-size: 13px; padding: 24px 0; }

.logs-table {
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--bg);
}
.log-row {
  display: grid;
  grid-template-columns: 220px 1fr auto;
  gap: 24px;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--line);
}
.log-row:last-child { border-bottom: none; }
.log-row:hover { background: var(--bg-soft); }
.log-dir { font-size: 12.5px; color: var(--ink-2); }
.log-links { display: flex; gap: 12px; flex-wrap: wrap; }
.log-link {
  font-size: 13px;
  color: var(--indigo);
  text-decoration: none;
  font-weight: 500;
}
.log-link:hover { text-decoration: underline; }

.empty-box {
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 40px 24px;
  text-align: center;
  color: var(--ink-3);
  font-size: 14px;
  background: var(--bg);
}

@media (max-width: 480px) {
  .log-row {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px 16px;
  }
  .log-actions { display: flex; justify-content: flex-end; }
}
</style>
