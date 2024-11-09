<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useServersStore } from '../stores/servers';
import { type DockerStats } from '../utils/interfaces';
import Loading from '../components/Loading.vue';
import NotFound from '../components/NotFound.vue';

const route = useRoute();

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
        <h1>Server Stats</h1>
        <p>Timestamp: {{ timestamp }}</p>
        <p>BlockIO: {{ stats?.BlockIO }}</p>
        <p>CPUPerc: {{ stats?.CPUPerc }}</p>
        <p>Container: {{ stats?.Container }}</p>
        <p>ID: {{ stats?.ID }}</p>
        <p>MemPerc: {{ stats?.MemPerc }}</p>
        <p>MemUsage: {{ stats?.MemUsage }}</p>
        <p>Name: {{ stats?.Name }}</p>
        <p>NetIO: {{ stats?.NetIO }}</p>
        <p>PIDs: {{ stats?.PIDs }}</p>
        <br />
        <button type="button" @click="updateStats()">Update</button>
        <button class="form-input-button" type="button" @click="stopAutoUpdate()" v-if="autoUpdateRunning">Stop Auto-Update</button>
        <button class="form-input-button" type="button" @click="startAutoUpdate()" v-else>Start Auto-Update</button>
    </div>
</template>

<style scoped></style>
