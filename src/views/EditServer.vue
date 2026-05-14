<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useServersStore } from '../stores/servers';
import { Server } from '../utils/interfaces';
import { defaultServer } from '../utils/defaults';
import Loading from '../components/Loading.vue';
import NotFound from '../components/NotFound.vue';
import ConfigForm from '../components/ConfigForm.vue';
import ConfigUploadDownload from '../components/ConfigUploadDownload.vue';
import TabPlayers from '../components/TabPlayers.vue';
import TabStats from '../components/TabStats.vue';
import TabSize from '../components/TabSize.vue';
import TabLogs from '../components/TabLogs.vue';

const router = useRouter();
const route = useRoute();
const loading = ref(true);
const found = ref(false);
const inputViolationCounter = ref(0);
const serversStore = useServersStore();
const server = ref<Server>(defaultServer);
const validTabs = ['settings', 'mods', 'players', 'stats', 'size', 'logs'];
const activeTab = ref<string>(validTabs.includes(route.query.tab as string) ? route.query.tab as string : 'settings');

serversStore.getAll().then(() => {
    const result = serversStore.servers.find(i => i.uuid === route.params.id);
    if (result) { server.value = result; found.value = true; }
    loading.value = false;
});

const tabs = [
    { key: 'settings', label: 'Settings' },
    { key: 'mods',     label: 'Mods' },
    { key: 'players',  label: 'Players' },
    { key: 'stats',    label: 'Stats' },
    { key: 'size',     label: 'Size' },
    { key: 'logs',     label: 'Logs' },
];

function onClone() {
    const clone = { ...server.value, name: server.value.name + ' Duplicate', uuid: '' };
    serversStore.add(clone).then(() => router.push('/servers-list'));
}
function onDelete() {
    if (confirm('Do you really want to delete this server?')) {
        serversStore.delete(route.params.id as string).then(() => router.push('/servers-list'));
    }
}

const disabled = computed<boolean>(() => inputViolationCounter.value > 0);

function updateServer() {
    serversStore.update(server.value).then(() => router.push('/servers-list'));
}

const isFormTab = computed(() => activeTab.value === 'settings' || activeTab.value === 'mods');
</script>

<template>
  <Loading v-if="loading" />
  <NotFound v-else-if="!found" />
  <main class="form-container" v-else>
    <div class="breadcrumb">
      <a @click="router.push('/servers-list')">Servers</a>
      <span class="sep">/</span>
      <span>{{ server.name }}</span>
    </div>

    <div class="server-detail-header">
      <h1>
        {{ server.name }}
        <span class="badge offline"><span class="dot"></span>Offline</span>
      </h1>
      <div class="header-actions">
        <ConfigUploadDownload v-model:server="server" />
        <span class="divider-v-lg"></span>
        <div class="btn-group">
          <button class="btn" type="button" @click="onClone">Clone</button>
          <button class="btn btn-danger" type="button" @click="onDelete">Delete</button>
        </div>
      </div>
    </div>

    <div class="tabs">
      <button
        v-for="tab in tabs" :key="tab.key"
        class="tab-btn" :class="{ active: activeTab === tab.key }"
        type="button" @click="activeTab = tab.key"
      >{{ tab.label }}</button>
    </div>

    <!-- Settings / Mods -->
    <ConfigForm
      v-if="isFormTab"
      v-model:input-violation-counter="inputViolationCounter"
      v-model:server="server"
      :tab="activeTab as 'settings' | 'mods'"
    />

    <!-- Other tabs -->
    <TabPlayers v-else-if="activeTab === 'players'" :server-id="server.uuid" />
    <TabStats   v-else-if="activeTab === 'stats'"   :server-id="server.uuid" />
    <TabSize    v-else-if="activeTab === 'size'"     :server-id="server.uuid" />
    <TabLogs    v-else-if="activeTab === 'logs'"     :server-id="server.uuid" />

    <!-- Save toolbar shown only on form tabs -->
    <div class="form-toolbar" v-if="isFormTab">
      <div class="form-toolbar-status">
        <span class="dot" :class="disabled ? 'red' : 'green'"></span>
        <span v-if="disabled">Fix {{ inputViolationCounter }} violation{{ inputViolationCounter > 1 ? 's' : '' }} before saving</span>
        <span v-else>Ready to save</span>
      </div>
      <div class="row">
        <button class="btn btn-ghost" type="button" @click="router.push('/servers-list')">Discard</button>
        <button class="btn btn-primary" type="button" :disabled @click="updateServer">Save changes</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.breadcrumb {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: var(--ink-3); margin-bottom: 10px;
}
.breadcrumb a { color: var(--ink-3); text-decoration: none; cursor: pointer; }
.breadcrumb a:hover { color: var(--ink); }
.breadcrumb .sep { color: var(--ink-4); }

.server-detail-header {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px 24px; margin-bottom: 32px;
}
.server-detail-header h1 {
  font-size: 26px; font-weight: 600; letter-spacing: -0.02em; margin: 0;
  display: flex; align-items: center; gap: 12px;
}
.header-actions { display: flex; align-items: center; gap: 8px; }
.divider-v-lg { width: 1px; height: 24px; background: var(--line); }

.tabs {
  display: flex; gap: 2px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 36px;
}
.tab-btn {
  appearance: none; background: none; border: none;
  font: inherit; font-size: 13.5px; font-weight: 500;
  color: var(--ink-3);
  padding: 10px 14px; margin-bottom: -1px;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}
.tab-btn:hover { color: var(--ink); }
.tab-btn.active { color: var(--ink); border-bottom-color: var(--ink); }
</style>
