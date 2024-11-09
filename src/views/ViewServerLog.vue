<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useServersStore } from '../stores/servers';
import Loading from '../components/Loading.vue';
import NotFound from '../components/NotFound.vue';

const route = useRoute();

const loading = ref(true);
const found = ref(false);

const serversStore = useServersStore();

const serverLog = ref('');
serversStore.getLog(route.params.id as string, route.params.log as string, route.params.file as string).then(log => {
    if (log) {
        serverLog.value = log.replace(/\n/g, '<br>');
        found.value = true;
    }
    loading.value = false;
});

async function importPlayers() {
    const importedPlayers = await serversStore.getPlayersFromLog(route.params.id as string, route.params.log as string);
    alert(`Imported ${importedPlayers.length} player(s) from log.`);
}
</script>

<template>
    <Loading v-if="loading" />
    <NotFound v-else-if="!found" />
    <div v-else>
        <h1>View Server Log {{ route.params.log }}/{{ route.params.file }}</h1>
        <button type="button" @click="importPlayers()">Import Players</button>
        <p v-html="serverLog"></p>
    </div>
</template>

<style scoped></style>
