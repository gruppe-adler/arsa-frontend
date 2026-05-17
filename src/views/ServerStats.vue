<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useServersStore } from '../stores/servers';
import Loading from '../components/Loading.vue';
import NotFound from '../components/NotFound.vue';
import { DockerStats } from '../api/model';
import prettyBytes from 'pretty-bytes';

const route = useRoute();

const loading = ref(true);
const found = ref(false);

const serversStore = useServersStore();

const stats = ref<DockerStats>({
    blockIoRead: 0,
    blockIoWrite: 0,
    cpuPercentage: 0,
    id: '',
    memLimit: 0,
    memUsage: 0,
    name: '',
    networkRxBytes: 0,
    networkTxBytes: 0,
    pidCount: 0,
    timestamp: ''
});
const timestamp = ref('');

const autoUpdateRunning = ref(false);

let intervalId = 0;

async function updateStats() {
    const result = await serversStore.getStats(route.params.id as string);
    if (result) {
        timestamp.value = new Date().toISOString();
        stats.value = result;
        found.value = true;
    }
    loading.value = false;
}

function startAutoUpdate() {
    intervalId = setInterval(() => {
        updateStats();
    }, 5_000);
    autoUpdateRunning.value = true;
}

function stopAutoUpdate() {
    clearInterval(intervalId);
    autoUpdateRunning.value = false;
}

onMounted(async () => {
    updateStats();
});

onBeforeUnmount(() => {
    if (autoUpdateRunning) clearInterval(intervalId);
});
</script>

<template>
    <Loading v-if="loading" />
    <NotFound v-else-if="!found" />
    <div v-else>
        <h1>Arma Reforger Server Stats</h1>
        <p>Timestamp: {{ new Date(timestamp).toLocaleString() }}</p>
        <p>BlockIO: {{ prettyBytes(stats?.blockIoRead) }} (Read) / {{ prettyBytes(stats?.blockIoWrite) }} (Write)</p>
        <p>CPU usage: {{ (stats?.cpuPercentage * 100).toFixed(2) }}%</p>
        <p>Name: {{ stats?.name }}</p>
        <p>ID: {{ stats?.id }}</p>
        <p>
            Memory usage: {{ prettyBytes(stats?.memUsage) }} / {{ prettyBytes(stats?.memLimit) }} ({{
                ((stats?.memUsage / stats?.memLimit) * 100).toFixed(2)
            }}%)
        </p>
        <p>Network IO: {{ prettyBytes(stats?.networkRxBytes) }} (Received) / {{ prettyBytes(stats?.networkTxBytes) }} (Transmitted)</p>
        <p>PID count: {{ stats?.pidCount }}</p>
        <br />
        <button type="button" @click="updateStats()">Update</button>
        <button class="form-input-button" type="button" @click="stopAutoUpdate()" v-if="autoUpdateRunning">Stop Auto-Update</button>
        <button class="form-input-button" type="button" @click="startAutoUpdate()" v-else>Start Auto-Update</button>
    </div>
</template>

<style scoped></style>
