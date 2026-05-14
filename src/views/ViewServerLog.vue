<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useServersStore } from '../stores/servers';
import Loading from '../components/Loading.vue';
import NotFound from '../components/NotFound.vue';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const found = ref(false);
const serversStore = useServersStore();
const serverLog = ref('');
const arsVersion = ref('');

refresh();

function refresh() {
    serversStore.getLog(
        route.params.id as string,
        route.params.log as string,
        route.params.file as string
    ).then(log => {
        if (log) {
            serverLog.value = log.replace(/\n/g, '<br>');
            found.value = true;
        }
        const versionRegEx = /version ([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+) built ([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{1,2}:[0-9]{2}:[0-9]{2} UTC)/;
        const match = versionRegEx.exec(log ?? '');
        if (match) arsVersion.value = `Arma Reforger Server v${match[1]} (build date ${match[2]})`;
        loading.value = false;
    });
}

async function importPlayers() {
    const imported = await serversStore.getPlayersFromLog(
        route.params.id as string,
        route.params.log as string
    );
    alert(`Imported ${imported.length} player(s) from log.`);
}
</script>

<template>
  <Loading v-if="loading" />
  <NotFound v-else-if="!found" />
  <main class="page-main" v-else>
    <div class="breadcrumb">
      <a @click="router.push(`/server-logs-list/${route.params.id}`)">Logs</a>
      <span class="sep">/</span>
      <span>{{ route.params.log }}/{{ route.params.file }}</span>
    </div>

    <div class="page-header">
      <div>
        <h1>{{ route.params.file }}</h1>
        <p v-if="arsVersion" class="mono version-line">{{ arsVersion }}</p>
      </div>
      <div class="row">
        <button class="btn btn-ghost" type="button" @click="importPlayers">Import players</button>
        <button class="btn" type="button" @click="refresh">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6"/></svg>
          Refresh
        </button>
      </div>
    </div>

    <div class="log-block" v-html="serverLog"></div>
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
.page-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 32px; margin-bottom: 32px;
}
.page-header h1 { font-size: 28px; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 6px; }
.version-line { margin: 0; color: var(--ink-3); font-size: 12.5px; }
</style>
