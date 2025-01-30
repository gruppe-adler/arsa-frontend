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

const crashReportsLog = ref('');

refresh();

function refresh() {
    serversStore.getCrashReportsLog(route.params.id as string).then(log => {
        if (log) {
            crashReportsLog.value = log.replace(/\n/g, '<br>');
            found.value = true;
        }
        loading.value = false;
    });
}
</script>

<template>
    <Loading v-if="loading" />
    <NotFound v-else-if="!found" />
    <div v-else>
        <h1>View Arma Reforger Server Crash Reports Log ({{ route.params.id }})</h1>
        <p v-html="crashReportsLog"></p>
        <button type="button" @click="refresh()">Refresh</button>
    </div>
</template>

<style scoped></style>
