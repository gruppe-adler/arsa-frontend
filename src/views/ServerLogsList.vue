<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useServersStore } from '../stores/servers';
import Loading from '../components/Loading.vue';
import NotFound from '../components/NotFound.vue';
import EmptyState from '../components/EmptyState.vue';
import { ResultLogs, Log } from '../utils/interfaces';

const route = useRoute();

const loading = ref(true);
const found = ref(false);

const serversStore = useServersStore();

const serverLogs = ref<ResultLogs>({
    success: false,
    logs: [],
    containsCrashReportsLog: false
});

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
    const clonedServerLogs: Log[] = Object.assign(serverLogs.value.logs); // clone array
    return clonedServerLogs.sort((a: Log, b: Log) => (a.dir < b.dir ? -1 : 1));
});

function onClickDelete(logName: string) {
    serversStore.deleteLog(route.params.id as string, logName).then(() => getLogs());
}
</script>

<template>
    <Loading v-if="loading" />
    <NotFound v-else-if="!found" />
    <div v-else>
        <h1>Arma Reforger Server Logs List</h1>
        <RouterLink class="links" :to="`/view-crash-reports-log/${route.params.id}`" v-if="serverLogs.containsCrashReportsLog"
            >CrashReports.log
        </RouterLink>
        <ul id="logs" v-if="sortedServerLogs.length > 0">
            <li class="logEntry" v-for="serverLog in sortedServerLogs">
                <button class="form-input-button" type="button" @click="onClickDelete(serverLog.dir)">Delete</button>
                {{ serverLog.dir }}:
                <RouterLink
                    class="links"
                    :to="`/view-server-log/${route.params.id}/${serverLog.dir}/console.log`"
                    v-if="serverLog.containsConsoleLog"
                    >console.log
                </RouterLink>
                <RouterLink
                    class="links"
                    :to="`/view-server-log/${route.params.id}/${serverLog.dir}/error.log`"
                    v-if="serverLog.containsErrorLog"
                    >error.log
                </RouterLink>
                <RouterLink
                    class="links"
                    :to="`/view-server-log/${route.params.id}/${serverLog.dir}/script.log`"
                    v-if="serverLog.containsScriptLog"
                    >script.log
                </RouterLink>
                <RouterLink
                    class="links"
                    :to="`/view-server-log/${route.params.id}/${serverLog.dir}/crash.log`"
                    v-if="serverLog.containsCrashLog"
                    >crash.log
                </RouterLink>
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

.logEntry {
    margin-bottom: 5px;
}

.links {
    margin-left: 10px;
}
</style>
