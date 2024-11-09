<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useServersStore } from '../stores/servers';

const route = useRoute();

const serversStore = useServersStore();

const serverLogs = ref<string[]>([]);

getLogs();

function getLogs() {
    serversStore.getLogs(route.params.id as string).then(logs => (serverLogs.value = logs));
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
    <h1>Server Logs List</h1>
    <ul id="logs">
        <li v-for="serverLog in sortedServerLogs">
            {{ serverLog }}:
            <RouterLink class="links" :to="`/view-server-log/${route.params.id}/${serverLog}/console.log`">console.log </RouterLink>
            <RouterLink class="links" :to="`/view-server-log/${route.params.id}/${serverLog}/error.log`">error.log </RouterLink>
            <RouterLink class="links" :to="`/view-server-log/${route.params.id}/${serverLog}/script.log`">script.log </RouterLink>
            <button class="form-input-button" type="button" @click="onClickDelete(serverLog)">Delete</button>
        </li>
    </ul>
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
