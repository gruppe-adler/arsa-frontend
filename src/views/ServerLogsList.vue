<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useServersStore } from '../stores/servers';
import Loading from '../components/Loading.vue';
import NotFound from '../components/NotFound.vue';
import EmptyState from '../components/EmptyState.vue';

const route = useRoute();

const loading = ref(true);
const found = ref(false);

const serversStore = useServersStore();

const serverLogs = ref<string[]>([]);

getLogs();

function getLogs() {
    serversStore.getLogs(route.params.id as string).then(logs => {
        if (logs) {
            serverLogs.value = logs;
            found.value = true;
        }
        loading.value = false;
    });
}

const sortedServerLogs = computed(() => {
    const clonedServerLogs = Object.assign([], serverLogs.value); // clone array
    return clonedServerLogs.sort((a: string, b: string) => (a < b ? -1 : 1));
});

function onClickDelete(logName: string) {
    serversStore.deleteLog(route.params.id as string, logName).then(() => getLogs());
}
</script>

<template>
    <Loading v-if="loading" />
    <NotFound v-else-if="!found" />
    <div v-else>
        <h1>Server Logs List</h1>
        <ul id="logs" v-if="sortedServerLogs.length > 0">
            <li v-for="serverLog in sortedServerLogs">
                {{ serverLog }}:
                <RouterLink class="links" :to="`/app/view-server-log/${route.params.id}/${serverLog}/console.log`">console.log </RouterLink>
                <RouterLink class="links" :to="`/app/view-server-log/${route.params.id}/${serverLog}/error.log`">error.log </RouterLink>
                <RouterLink class="links" :to="`/app/view-server-log/${route.params.id}/${serverLog}/script.log`">script.log </RouterLink>
                <button class="form-input-button" type="button" @click="onClickDelete(serverLog)">Delete</button>
            </li>
        </ul>
        <EmptyState v-else />
    </div>
</template>

<style scoped>
#logs {
    list-style-type: none;
    padding: 0px;
}

.links {
    margin-left: 10px;
}
</style>
