<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useServersStore } from '../stores/servers';
import Loading from '../components/Loading.vue';
import NotFound from '../components/NotFound.vue';
import { DockerStats } from '../api/model';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const found = ref(false);
const serversStore = useServersStore();
const stats = ref<DockerStats | null>(null);
const timestamp = ref('');
const autoUpdateRunning = ref(false);
let intervalId = 0;

async function updateStats() {
    const result = await serversStore.getStats(route.params.id as string);
    if (result) {
        timestamp.value = new Date().toLocaleTimeString();
        stats.value = result;
        found.value = true;
    }
    loading.value = false;
}

function startAutoUpdate() {
    intervalId = setInterval(() => updateStats(), 5_000);
    autoUpdateRunning.value = true;
}
function stopAutoUpdate() {
    clearInterval(intervalId);
    autoUpdateRunning.value = false;
}

onMounted(() => updateStats());
onBeforeUnmount(() => {
    if (autoUpdateRunning.value) clearInterval(intervalId);
});

const rows = [
    { key: 'CPUPerc', label: 'CPU' },
    { key: 'MemUsage', label: 'Memory usage' },
    { key: 'MemPerc', label: 'Memory %' },
    { key: 'NetIO', label: 'Network I/O' },
    { key: 'BlockIO', label: 'Block I/O' },
    { key: 'PIDs', label: 'PIDs' },
    { key: 'Name', label: 'Container name' },
    { key: 'ID', label: 'Container ID2' }
] as const;
</script>

<template>
    <Loading v-if="loading" />
    <NotFound v-else-if="!found" />
    <main class="page-main" v-else>
        <div class="breadcrumb">
            <a @click="router.back()">Server</a>
            <span class="sep">/</span>
            <span>Stats</span>
        </div>

        <div class="page-header">
            <div>
                <h1>Server Stats</h1>
                <p v-if="timestamp">Last updated {{ timestamp }}</p>
            </div>
            <div class="row">
                <button class="btn" @click="updateStats">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6" />
                    </svg>
                    Refresh
                </button>
                <button class="btn btn-stop" v-if="autoUpdateRunning" @click="stopAutoUpdate">Stop auto-update</button>
                <button class="btn btn-start" v-else @click="startAutoUpdate">Auto-update</button>
            </div>
        </div>

        <div class="data-table">
            <div class="table-row" v-for="row in rows" :key="row.key">
                <span class="stat-label">{{ row.label }}</span>
                <span class="mono stat-value">{{ stats?.[row.key] ?? '—' }}</span>
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
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--ink-3);
    margin-bottom: 10px;
}
.breadcrumb a {
    color: var(--ink-3);
    text-decoration: none;
    cursor: pointer;
}
.breadcrumb a:hover {
    color: var(--ink);
}
.breadcrumb .sep {
    color: var(--ink-4);
}
.page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 32px;
    margin-bottom: 32px;
}
.page-header h1 {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.02em;
    margin: 0 0 6px;
}
.page-header p {
    margin: 0;
    color: var(--ink-3);
    font-size: 13px;
}

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
.table-row:last-child {
    border-bottom: none;
}
.stat-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 600;
    color: var(--ink-3);
}
.stat-value {
    color: var(--ink);
    font-size: 13px;
}
</style>
