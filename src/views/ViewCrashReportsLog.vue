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
const crashReportsLog = ref('');

refresh();
function refresh() {
    serversStore.getCrashReportsLog(route.params.id as string).then(log => {
        if (log) { crashReportsLog.value = log.replace(/\n/g, '<br>'); found.value = true; }
        loading.value = false;
    });
}
</script>

<template>
  <Loading v-if="loading" />
  <NotFound v-else-if="!found" />
  <main class="page-main" v-else>
    <div class="breadcrumb">
      <a @click="router.push(`/server-logs-list/${route.params.id}`)">Logs</a>
      <span class="sep">/</span>
      <span>CrashReports.log</span>
    </div>

    <div class="page-header">
      <h1>CrashReports.log</h1>
      <button class="btn" type="button" @click="refresh">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6"/></svg>
        Refresh
      </button>
    </div>

    <div class="log-block" v-html="crashReportsLog"></div>
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
  display: flex; align-items: center; justify-content: space-between;
  gap: 32px; margin-bottom: 32px;
}
.page-header h1 { font-size: 28px; font-weight: 600; letter-spacing: -0.02em; margin: 0; }
</style>
