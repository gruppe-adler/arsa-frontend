<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useServersStore } from '../stores/servers';
import Loading from '../components/Loading.vue';
import NotFound from '../components/NotFound.vue';
import { ResultSize } from '../api/model';
import prettyBytes from 'pretty-bytes';

const route = useRoute();

const loading = ref(true);
const found = ref(false);

const serversStore = useServersStore();

const size = ref<ResultSize>({
    addonsSize: 0,
    logsSize: 0,
    profileSize: 0,
    mods: [],
    logs: []
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
    const mods = size.value.mods;
    return mods.join('\n');
});

const allLogs = computed(() => {
    const logs = size.value.logs;
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
        <h2>Total Size: {{ prettyBytes(size.profileSize + size.addonsSize + size.logsSize) }}</h2>
        <h3>Profile: {{ prettyBytes(size.profileSize) }}</h3>
        <h3>Mods: {{ prettyBytes(size.addonsSize) }}</h3>
        <pre v-html="allMods"></pre>
        <h3>Logs: {{ prettyBytes(size.logsSize) }}</h3>
        <pre v-html="allLogs"></pre>
    </div>
</template>

<style scoped></style>
