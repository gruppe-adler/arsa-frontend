<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useServersStore } from '../stores/servers';
import { ResultSize } from '../utils/interfaces';

const props = defineProps<{ serverId: string }>();

const serversStore = useServersStore();
const loading = ref(true);
const size = ref<ResultSize>({ profileDir: '', serverDir: '', modsDir: '', logsDir: '', allMods: '', allLogs: '' });

async function load() {
    loading.value = true;
    const result = await serversStore.getSize(props.serverId);
    if (result) size.value = result;
    loading.value = false;
}

watch(() => props.serverId, load, { immediate: true });

const allMods = computed(() => {
    const lines = size.value.allMods.split('\n');
    lines.pop(); lines.pop();
    return lines.join('\n');
});
const allLogs = computed(() => {
    const lines = size.value.allLogs.split('\n');
    lines.pop(); lines.pop();
    return lines.join('\n');
});
</script>

<template>
  <div class="tab-loading" v-if="loading">Loading…</div>
  <div class="size-sections" v-else>
    <div class="size-card">
      <div class="size-card-head">
        <span class="size-label">Profile directory</span>
        <span class="size-value mono">{{ size.profileDir }}</span>
      </div>
      <div class="size-subsection">
        <div class="size-subrow">
          <span class="size-label">Mods</span>
          <span class="size-value mono">{{ size.modsDir }}</span>
        </div>
        <pre class="size-pre" v-if="allMods">{{ allMods }}</pre>
        <div class="size-subrow">
          <span class="size-label">Logs</span>
          <span class="size-value mono">{{ size.logsDir }}</span>
        </div>
        <pre class="size-pre" v-if="allLogs">{{ allLogs }}</pre>
      </div>
    </div>
    <div class="size-card">
      <div class="size-card-head">
        <span class="size-label">Server directory</span>
        <span class="size-value mono">{{ size.serverDir }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-loading { color: var(--ink-3); font-size: 13px; padding: 24px 0; }

.size-sections { display: flex; flex-direction: column; gap: 16px; }
.size-card {
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--bg);
  overflow: hidden;
}
.size-card-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid var(--line);
  background: var(--bg-soft);
}
.size-subsection { padding: 0 24px; }
.size-subrow {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid var(--line);
}
.size-subrow:last-of-type { border-bottom: none; }
.size-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
  color: var(--ink-3);
}
.size-value { color: var(--ink); font-size: 13px; }
.size-pre {
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 12px;
  color: var(--ink-2);
  line-height: 1.7;
  margin: 0 0 16px;
  white-space: pre-wrap;
  word-break: break-all;
}

@media (max-width: 480px) {
  .size-card-head { padding: 14px 16px; }
  .size-subsection { padding: 0 16px; }
  .size-subrow { flex-direction: column; align-items: flex-start; gap: 2px; }
}
</style>
