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

const arsVersion = ref('');

refresh();

function refresh() {
    serversStore.getLog(route.params.id as string, route.params.log as string, route.params.file as string).then(log => {
        if (log) {
            serverLog.value = log.replace(/\n/g, '<br>');
            found.value = true;
        }

        // extract version if any
        const versionRegEx = new RegExp(
            'version ([0-9]+.[0-9]+.[0-9]+.[0-9]+) built ([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{1,2}:[0-9]{2}:[0-9]{2} UTC)'
        );
        const versionResult = versionRegEx.exec(serverLog.value);

        if (versionResult !== null) {
            arsVersion.value = `Arma Reforger Server v${versionResult[1]} (build date ${versionResult[2]})`;
        }

        loading.value = false;
    });
}

async function importPlayers() {
    const importedPlayers = await serversStore.getPlayersFromLog(route.params.id as string, route.params.log as string);
    alert(`Imported ${importedPlayers.length} player(s) from log.`);
}
</script>

<template>
    <Loading v-if="loading" />
    <NotFound v-else-if="!found" />
    <div v-else>
        <h1>View Arma Reforger Server Log {{ route.params.log }}/{{ route.params.file }}</h1>
        <button type="button" @click="importPlayers()">Import Players</button>
        <p>{{ arsVersion }}</p>
        <p v-html="serverLog"></p>
        <button type="button" @click="refresh()">Refresh</button>
    </div>
</template>

<style scoped></style>
