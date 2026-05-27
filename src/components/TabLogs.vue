<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { TooltipRoot, TooltipTrigger, TooltipPortal, TooltipContent } from 'reka-ui';
import { useServersStore } from '../stores/servers';
import { Log, ResultLogs } from '../api/model';

const props = defineProps<{ serverId: string }>();

const serversStore = useServersStore();
const loading = ref(true);
const serverLogs = ref<ResultLogs>({ success: false, logs: [], containsCrashReportLog: false });

function getRelativeTime(timestamp: string): string {
    if (!timestamp) return timestamp;
    try {
        // Parse timestamps like "logs_2026-05-13_08-00-00"
        const [, datePart, timePart] = timestamp.split('_');
        if (!datePart || !timePart) return timestamp;

        const [year, month, day] = datePart.split('-');
        const [hour, min, sec] = timePart.split('-');
        const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(min), parseInt(sec)));

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return `${diffSec}s ago`;
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHour < 24) return `${diffHour}h ago`;
        return `${diffDay}d ago`;
    } catch {
        return timestamp;
    }
}

async function load() {
    loading.value = true;
    const logs = await serversStore.getLogs(props.serverId);
    if (logs) serverLogs.value = logs;
    loading.value = false;
}

watch(() => props.serverId, load, { immediate: true });

const sorted = computed(() => ([...serverLogs.value.logs] as Log[]).sort((a, b) => (a.dir > b.dir ? -1 : 1)));

function onDelete(logName: string) {
    serversStore.deleteLog(props.serverId, logName).then(load);
}
</script>

<template>
    <div v-if="loading" class="tab-loading">Loading…</div>
    <template v-else>
        <div v-if="sorted.length > 0 || serverLogs.containsCrashReportLog" class="logs-table">
            <div v-if="serverLogs.containsCrashReportLog" class="log-row">
                <span class="mono log-dir">CrashReports.log</span>
                <div class="log-links">
                    <RouterLink class="log-link" :to="`/view-crash-reports-log/${props.serverId}`">View</RouterLink>
                </div>
                <div></div>
            </div>
            <div v-for="log in sorted" :key="log.dir" class="log-row">
                <TooltipRoot :delayDuration="0">
                    <TooltipTrigger asChild>
                        <span class="mono log-dir">{{ getRelativeTime(log.dir) }}</span>
                    </TooltipTrigger>
                    <TooltipPortal>
                        <TooltipContent class="log-time-tooltip" side="right" :sideOffset="8">
                            {{ log.dir }}
                        </TooltipContent>
                    </TooltipPortal>
                </TooltipRoot>
                <div class="log-links">
                    <RouterLink
                        v-if="log.containsConsoleLog"
                        class="log-link"
                        :to="`/view-server-log/${props.serverId}/${log.dir}/console.log`"
                        >console.log</RouterLink
                    >
                    <RouterLink v-if="log.containsErrorLog" class="log-link" :to="`/view-server-log/${props.serverId}/${log.dir}/error.log`"
                        >error.log</RouterLink
                    >
                    <RouterLink
                        v-if="log.containsScriptLog"
                        class="log-link"
                        :to="`/view-server-log/${props.serverId}/${log.dir}/script.log`"
                        >script.log</RouterLink
                    >
                    <RouterLink v-if="log.containsCrashLog" class="log-link" :to="`/view-server-log/${props.serverId}/${log.dir}/crash.log`"
                        >crash.log</RouterLink
                    >
                </div>
                <div class="log-actions">
                    <button class="btn btn-ghost btn-danger" type="button" @click="onDelete(log.dir)">Delete</button>
                </div>
            </div>
        </div>
        <div v-else class="empty-box">No log entries found.</div>
    </template>
</template>

<style scoped>
.tab-loading {
    color: var(--ink-3);
    font-size: 13px;
    padding: 24px 0;
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

@media (max-width: 480px) {
    .log-row {
        grid-template-columns: 1fr;
        gap: 8px;
        padding: 12px 16px;
    }
    .log-actions {
        display: flex;
        justify-content: flex-end;
    }
}
</style>

<style>
/* Global styles for log time tooltip - cannot be scoped */
.log-time-tooltip {
    padding: 6px 10px;
    font-size: 12px;
    line-height: 1.4;
    color: var(--bg) !important;
    background: var(--ink) !important;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 99999 !important;
    font-family: 'Geist Mono', ui-monospace, monospace;
    white-space: nowrap;
}
</style>
