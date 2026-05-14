<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useServersStore } from '../stores/servers';
import ServerItem from '../components/ServerItem.vue';
import { Server } from '../utils/interfaces';
import HostServerLog from '../components/HostServerLog.vue';

const serversStore = useServersStore();
const router = useRouter();

serversStore.getPublicIp().then(() => {});
updateServerList();

function updateServerList() {
    serversStore.getAll().then(() => {});
}

function onServerDeleted() { updateServerList(); }
function onServerCloned()  { updateServerList(); }

const sortedServers = computed(() => {
    const cloned = Object.assign([], serversStore.servers) as Server[];
    return cloned.sort((a, b) => (a.name < b.name ? -1 : 1));
});
</script>

<template>
  <main>
    <div class="page-header">
      <div>
        <h1>Servers</h1>
        <p>Manage Arma Reforger server instances. Start, stop, clone, or inspect logs and statistics.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-ghost" @click="updateServerList">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6"/></svg>
          Refresh
        </button>
        <button class="btn btn-primary" @click="router.push('/add-server')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          New server
        </button>
      </div>
    </div>

    <div class="servers" v-if="sortedServers.length > 0">
      <ServerItem
        v-for="(_item, idx) in sortedServers"
        :key="sortedServers[idx].uuid"
        v-model="sortedServers[idx]"
        @server-deleted="onServerDeleted"
        @server-cloned="onServerCloned"
      />
    </div>
    <div class="servers empty-servers" v-else>
      <p class="empty-label">No servers yet. Add one to get started.</p>
    </div>

    <h2 class="section-title">Host server log</h2>
    <HostServerLog />
  </main>
</template>

<style scoped>
main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px var(--gutter) 96px;
}
.page-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 32px;
  margin-bottom: 36px;
}
.page-header h1 {
  font-size: 28px; font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0 0 6px;
}
.page-header p {
  margin: 0; color: var(--ink-3); font-size: 14px; max-width: 56ch;
}
.page-actions { display: flex; gap: 8px; flex-shrink: 0; }

.servers {
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--bg);
  overflow: hidden;
}
.empty-servers {
  padding: 40px 24px;
  display: flex; align-items: center; justify-content: center;
}
.empty-label { color: var(--ink-3); font-size: 14px; margin: 0; }
</style>
