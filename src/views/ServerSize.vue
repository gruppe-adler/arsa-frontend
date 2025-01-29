<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useServersStore } from '../stores/servers';
import Loading from '../components/Loading.vue';
import NotFound from '../components/NotFound.vue';
import { ResultSize } from '../utils/interfaces';

const route = useRoute();

const loading = ref(true);
const found = ref(false);

const serversStore = useServersStore();

const size = ref<ResultSize>({
    profileDir: 'unknown',
    serverDir: 'unknown',
    modsDir: 'unknown',
    logsDir: 'unknown',
    allMods: 'unknown',
    allLogs: 'unknown'
});

async function getSize() {
    const result = await serversStore.getSize(route.params.id as string);
    if (result) {
        size.value = result;
        found.value = true;
    }
    loading.value = false;
}

const allMods = computed(() => {
    const mods = size.value.allMods.split('\n');
    mods.pop();
    mods.pop();
    return mods.join('\n');
});

const allLogs = computed(() => {
    const logs = size.value.allLogs.split('\n');
    logs.pop();
    logs.pop();
    return logs.join('\n');
});

onMounted(async () => {
    getSize();
});
</script>

<template>
    <Loading v-if="loading" />
    <NotFound v-else-if="!found" />
    <div v-else>
        <h1>Arma Reforger Server Size</h1>
        <h2>Profile: {{ size.profileDir }}</h2>
        <h3>Mods: {{ size.modsDir }}</h3>
        <pre v-html="allMods"></pre>
        <h3>Logs: {{ size.logsDir }}</h3>
        <pre v-html="allLogs"></pre>
        <h2>Server: {{ size.serverDir }}</h2>
    </div>
</template>

<style scoped></style>
