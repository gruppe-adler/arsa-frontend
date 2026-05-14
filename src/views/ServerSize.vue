<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useServersStore } from '../stores/servers';
import Loading from '../components/Loading.vue';
import NotFound from '../components/NotFound.vue';
import { ResultSize } from '../utils/interfaces';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const found = ref(false);
const serversStore = useServersStore();

const size = ref<ResultSize>({
    profileDir: '', serverDir: '', modsDir: '', logsDir: '', allMods: '', allLogs: ''
});

async function getSize() {
    const result = await serversStore.getSize(route.params.id as string);
    if (result) { size.value = result; found.value = true; }
    loading.value = false;
}

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

onMounted(() => getSize());
</script>

<template>
  <Loading v-if="loading" />
  <NotFound v-else-if="!found" />
  <main class="page-main" v-else>
    <div class="breadcrumb">
      <a @click="router.back()">Server</a>
      <span class="sep">/</span>
      <span>Size</span>
    </div>

    <div class="page-header">
      <h1>Disk Usage</h1>
    </div>

    <div class="size-sections">
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
  </main>
</template>

<style scoped>
.page-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px var(--gutter) 96px;
}
.breadcrumb {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: var(--ink-3); margin-bottom: 10px;
}
.breadcrumb a { color: var(--ink-3); text-decoration: none; cursor: pointer; }
.breadcrumb a:hover { color: var(--ink); }
.breadcrumb .sep { color: var(--ink-4); }
.page-header { margin-bottom: 32px; }
.page-header h1 { font-size: 28px; font-weight: 600; letter-spacing: -0.02em; margin: 0; }

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
</style>
