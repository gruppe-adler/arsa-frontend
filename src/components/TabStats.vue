<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import { useServersStore } from '../stores/servers';
import { DockerStats } from '../api/model';
import prettyBytes from 'pretty-bytes';

const props = defineProps<{ serverId: string }>();

const serversStore = useServersStore();
const loading = ref(true);
const stats = ref<DockerStatsEntry[]>([]);
const timestamp = ref('');
const autoUpdateRunning = ref(false);
let intervalId = 0;

interface DockerStatsEntry {
    order: number;
    label: string;
    value: string;
}

async function updateStats() {
    const result = await serversStore.getStats(props.serverId);
    if (result) {
        timestamp.value = new Date(result.timestamp).toLocaleString();
        stats.value = buildEntries(result);
    }
    loading.value = false;
}

function buildEntries(stats: DockerStats): DockerStatsEntry[] {
    if (!stats) {
        return [];
    }
    return [
        { order: 0, label: 'CPU usage', value: `${(stats.cpuPercentage * 100).toFixed(2)}%` },
        {
            order: 1,
            label: 'Memory usage',
            value: `${prettyBytes(stats?.memUsage)} / ${prettyBytes(stats?.memLimit)} (${(
                (stats?.memUsage / stats?.memLimit) *
                100
            ).toFixed(2)}%)`
        },
        {
            order: 2,
            label: 'Network I/O',
            value: `${prettyBytes(stats?.networkRxBytes)} (Received) / ${prettyBytes(stats?.networkTxBytes)} (Transmitted)`
        },
        { order: 3, label: 'Block I/O', value: `${prettyBytes(stats?.blockIoRead)} (Read) / ${prettyBytes(stats?.blockIoWrite)} (Write)` },
        { order: 4, label: 'PID Count', value: stats.pidCount.toString() },
        { order: 5, label: 'Container name', value: stats.name },
        { order: 6, label: 'Container ID', value: stats.id }
    ];
}

function startAutoUpdate() {
    intervalId = setInterval(updateStats, 5_000);
    autoUpdateRunning.value = true;
}
function stopAutoUpdate() {
    clearInterval(intervalId);
    autoUpdateRunning.value = false;
}

watch(
    () => props.serverId,
    () => {
        loading.value = true;
        updateStats();
    },
    { immediate: true }
);
onBeforeUnmount(() => {
    if (autoUpdateRunning.value) clearInterval(intervalId);
});
</script>

<template>
    <div class="tab-actions">
        <span class="timestamp" v-if="timestamp">Last updated {{ timestamp }}</span>
        <span class="stretch"></span>
        <button class="btn" @click="updateStats" :disabled="loading">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6" />
            </svg>
            Refresh
        </button>
        <button class="btn btn-stop" v-if="autoUpdateRunning" @click="stopAutoUpdate">Stop auto-update</button>
        <button class="btn btn-start" v-else @click="startAutoUpdate">Auto-update</button>
    </div>

    <div class="data-table" v-if="stats">
        <div class="table-row" v-for="stat in stats" :key="stat.order">
            <span class="stat-label">{{ stat.label }}</span>
            <span class="mono stat-value">{{ stat.value }}</span>
        </div>
    </div>
    <div class="empty-box" v-else>
        <span v-if="loading" class="loading-text">Loading…</span>
        <span v-else>No stats available. Server may be offline.</span>
    </div>
</template>

<style scoped>
.tab-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
}
.timestamp {
    font-size: 12.5px;
    color: var(--ink-3);
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
    .table-row {
        grid-template-columns: 1fr;
        gap: 2px;
        padding: 10px 16px;
    }
}
</style>
