<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useServersStore } from '../stores/servers';
import Loading from '../components/Loading.vue';
import NotFound from '../components/NotFound.vue';
import { Log, ResultLogs } from '../api/model';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const found = ref(false);
const serversStore = useServersStore();

const serverLogs = ref<ResultLogs>({ success: false, logs: [], containsCrashReportLog: false });

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
    const cloned: Log[] = Object.assign([], serverLogs.value.logs);
    return cloned.sort((a, b) => (a.dir < b.dir ? -1 : 1));
});

function onClickDelete(logName: string) {
    serversStore.deleteLog(route.params.id as string, logName).then(() => getLogs());
}
</script>

<template>
    <Loading v-if="loading" />
    <NotFound v-else-if="!found" />
    <main class="page-main" v-else>
        <div class="breadcrumb">
            <a @click="router.back()">Server</a>
            <span class="sep">/</span>
            <span>Logs</span>
        </div>

        <div class="page-header">
            <h1>Server Logs</h1>
        </div>

        <div class="logs-table" v-if="sortedServerLogs.length > 0 || serverLogs.containsCrashReportLog">
            <div class="log-row crash-row" v-if="serverLogs.containsCrashReportLog">
                <span class="mono log-dir">CrashReports.log</span>
                <div class="log-links">
                    <RouterLink class="log-link" :to="`/view-crash-reports-log/${route.params.id}`">View</RouterLink>
                </div>
                <div class="log-actions"></div>
            </div>
            <div class="log-row" v-for="log in sortedServerLogs" :key="log.dir">
                <span class="mono log-dir">{{ log.dir }}</span>
                <div class="log-links">
                    <RouterLink
                        class="log-link"
                        :to="`/view-server-log/${route.params.id}/${log.dir}/console.log`"
                        v-if="log.containsConsoleLog"
                        >console.log</RouterLink
                    >
                    <RouterLink
                        class="log-link"
                        :to="`/view-server-log/${route.params.id}/${log.dir}/error.log`"
                        v-if="log.containsErrorLog"
                        >error.log</RouterLink
                    >
                    <RouterLink
                        class="log-link"
                        :to="`/view-server-log/${route.params.id}/${log.dir}/script.log`"
                        v-if="log.containsScriptLog"
                        >script.log</RouterLink
                    >
                    <RouterLink
                        class="log-link"
                        :to="`/view-server-log/${route.params.id}/${log.dir}/crash.log`"
                        v-if="log.containsCrashLog"
                        >crash.log</RouterLink
                    >
                </div>
                <div class="log-actions">
                    <button class="btn btn-ghost btn-danger" type="button" @click="onClickDelete(log.dir)">Delete</button>
                </div>
            </div>
        </div>
        <div class="empty-box" v-else>No log entries found.</div>
    </main>
</template>

<style scoped>
.page-main {
    max-width: 1280px;
    margin: 0 auto;
    padding: 48px var(--gutter) 96px;
}
.breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--ink-3);
    margin-bottom: 10px;
}
.breadcrumb a {
    color: var(--ink-3);
    text-decoration: none;
    cursor: pointer;
}
.breadcrumb a:hover {
    color: var(--ink);
}
.breadcrumb .sep {
    color: var(--ink-4);
}
.page-header {
    margin-bottom: 32px;
}
.page-header h1 {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.02em;
    margin: 0;
}

.logs-table {
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--bg);
}
.log-row {
    display: grid;
    grid-template-columns: 220px 1fr auto;
    gap: 24px;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid var(--line);
}
.log-row:last-child {
    border-bottom: none;
}
.log-row:hover {
    background: var(--bg-soft);
}
.log-dir {
    font-size: 12.5px;
    color: var(--ink-2);
}
.log-links {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}
.log-link {
    font-size: 13px;
    color: var(--indigo);
    text-decoration: none;
    font-weight: 500;
}
.log-link:hover {
    text-decoration: underline;
}

.empty-box {
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    padding: 40px 24px;
    text-align: center;
    color: var(--ink-3);
    font-size: 14px;
    background: var(--bg);
}
</style>
