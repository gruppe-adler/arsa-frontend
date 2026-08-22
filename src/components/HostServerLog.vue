<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { TooltipRoot, TooltipTrigger, TooltipPortal, TooltipContent } from 'reka-ui';
import { useLogsStore } from '../stores/logs';
import { useServersStore } from '../stores/servers';
import { GlobalLog, LogAction } from '../api/model';

const props = withDefaults(
    defineProps<{
        page?: number;
        limit?: number;
    }>(),
    {
        page: 1
    }
);

const logsStore = useLogsStore();
const serversStore = useServersStore();
const pageSize = computed(() => {
    const limit = props.limit ?? 50;

    return Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 50;
});

interface TextPart {
    kind: 'text';
    text: string;
}
interface ChipPart {
    kind: 'chip';
    uuid: string;
    serverName: string;
}
type Part = TextPart | ChipPart;

interface ParsedEntry {
    timestamp: string;
    relativeTime: string;
    parts: Part[];
}

function resolveServerName(uuid: string): string {
    return serversStore.servers.find(s => s.uuid === uuid)?.name ?? uuid.slice(0, 8);
}

function actionToLabel(log: GlobalLog): string {
    switch (log.action) {
        case LogAction.ServerAdded:
            return `Server added by ${log.actor} `;
        case LogAction.ServerDeleted:
            return `Server deleted by ${log.actor} `;
        case LogAction.ServerStarted:
            return `Server started by ${log.actor} `;
        case LogAction.ServerUpdated:
            return `Server updated by ${log.actor} `;
        case LogAction.ServerStopped:
            return `Server stopped by  ${log.actor} `;
        case LogAction.ServerLogDeleted:
            return `Server log deleted by ${log.actor} `;
        case LogAction.ImagePullStarted:
            return `Image pull started by ${log.actor} `;
        default:
            return log.action;
    }
}

function parseEntry(log: GlobalLog): ParsedEntry {
    const timestamp = new Date(log.timestamp);
    const timestampLocal = timestamp.toLocaleString();
    const timestampRelative = getRelativeTime(timestamp);

    const parts: Part[] = [{ kind: 'text', text: actionToLabel(log) }];

    if (log.target) {
        parts.push({ kind: 'chip', uuid: log.target ?? '', serverName: resolveServerName(log.target) });
    }

    return {
        timestamp: timestampLocal,
        relativeTime: timestampRelative,
        parts: parts
    };
}

function getRelativeTime(date: Date): string {
    try {
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
        return date.toLocaleString();
    }
}

const parsedLogs = computed(() => logsStore.logs.map(parseEntry));
const hasMoreLogs = computed(() => logsStore.globalLogsTotalPages > 0 && logsStore.globalLogsPage < logsStore.globalLogsTotalPages);
const isLoading = ref(false);
const loadError = ref('');
const loadMoreSentinel = ref<HTMLElement | null>(null);
let loadMoreObserver: IntersectionObserver | undefined;

function isSentinelVisible(): boolean {
    const sentinel = loadMoreSentinel.value;

    if (!sentinel) {
        return false;
    }

    const rect = sentinel.getBoundingClientRect();
    return rect.top <= window.innerHeight + 200;
}

async function loadPage(page: number) {
    if (isLoading.value) {
        return;
    }

    isLoading.value = true;
    loadError.value = '';

    try {
        await logsStore.getLogs({
            page,
            limit: pageSize.value
        });
    } catch (error) {
        loadError.value = error instanceof Error ? error.message : 'Failed to load host log.';
    } finally {
        isLoading.value = false;
    }
}

async function loadInitialLogs() {
    await loadPage(1);
    await nextTick();

    if (hasMoreLogs.value && isSentinelVisible()) {
        await loadNextPage();
    }
}

async function loadNextPage() {
    if (isLoading.value || !hasMoreLogs.value) {
        return;
    }

    const nextPage = logsStore.globalLogsPage + 1;
    await loadPage(nextPage);
    await nextTick();

    if (hasMoreLogs.value && isSentinelVisible()) {
        await loadNextPage();
    }
}

function setupObserver() {
    loadMoreObserver?.disconnect();

    const sentinel = loadMoreSentinel.value;

    if (!sentinel) {
        return;
    }

    loadMoreObserver = new IntersectionObserver(
        entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                void loadNextPage();
            }
        },
        {
            rootMargin: '200px 0px'
        }
    );

    loadMoreObserver.observe(sentinel);
}

onMounted(async () => {
    setupObserver();
    await loadInitialLogs();
});

onBeforeUnmount(() => {
    loadMoreObserver?.disconnect();
});

watch(pageSize, () => {
    void loadInitialLogs();
});

watch(loadMoreSentinel, () => {
    setupObserver();
});

const copyStates = ref<Record<string, boolean>>({});
const copyTimers: Record<string, ReturnType<typeof setTimeout>> = {};

async function copyUuid(key: string, uuid: string) {
    try {
        await navigator.clipboard.writeText(uuid);
    } catch {}
    copyStates.value[key] = true;
    clearTimeout(copyTimers[key]);
    copyTimers[key] = setTimeout(() => {
        copyStates.value[key] = false;
    }, 1400);
}

const logCopied = ref(false);
let logCopyTimer: ReturnType<typeof setTimeout>;

async function copyAllLogs() {
    try {
        await navigator.clipboard.writeText(
            parsedLogs.value
                .map(entry => `${entry.timestamp} ${entry.parts.map(part => (part.kind === 'text' ? part.text : part.uuid)).join('')}`)
                .join('\n')
        );
        logCopied.value = true;
        clearTimeout(logCopyTimer);
        logCopyTimer = setTimeout(() => {
            logCopied.value = false;
        }, 1400);
    } catch {}
}
</script>

<template>
    <div class="log-wrapper">
        <div v-if="loadError" class="log-error">{{ loadError }}</div>
        <button
            v-if="parsedLogs.length > 0"
            class="copy-log-btn"
            :class="{ copied: logCopied }"
            :title="logCopied ? 'Copied!' : 'Copy all logs to clipboard'"
            @click="copyAllLogs"
        >
            <svg
                v-if="!logCopied"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <svg
                v-else
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M5 12l5 5L20 7" />
            </svg>
        </button>
        <div v-if="isLoading && parsedLogs.length === 0" class="log-block empty-log">
            <span class="log-empty">Loading host log…</span>
        </div>
        <div v-else-if="parsedLogs.length > 0" class="log-block">
            <div v-for="(entry, i) in parsedLogs" :key="i" class="log-row">
                <TooltipRoot :delayDuration="0">
                    <TooltipTrigger asChild>
                        <span class="log-time">{{ entry.relativeTime || entry.timestamp }}</span>
                    </TooltipTrigger>
                    <TooltipPortal>
                        <TooltipContent class="log-time-tooltip" side="right" :sideOffset="8">
                            {{ entry.timestamp }}
                        </TooltipContent>
                    </TooltipPortal>
                </TooltipRoot>
                <span class="log-msg">
                    <template v-for="(part, j) in entry.parts" :key="j">
                        <button
                            v-if="part.kind === 'chip'"
                            class="id-chip"
                            :class="{ copied: copyStates[`${i}-${j}`] }"
                            :title="copyStates[`${i}-${j}`] ? 'Copied!' : 'Click to copy UUID'"
                            @click="copyUuid(`${i}-${j}`, part.uuid)"
                        >
                            <span class="id-label">{{ part.serverName }}</span>
                            <svg
                                v-if="!copyStates[`${i}-${j}`]"
                                width="11"
                                height="11"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <rect x="9" y="9" width="13" height="13" rx="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            <svg
                                v-else
                                width="11"
                                height="11"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M5 12l5 5L20 7" />
                            </svg>
                        </button>
                        <template v-else>{{ part.text }}</template>
                    </template>
                </span>
            </div>
        </div>
        <div v-else class="log-block empty-log">
            <span class="log-empty">No log entries yet.</span>
        </div>
        <div v-if="parsedLogs.length > 0" class="log-footer">
            <span v-if="isLoading">Loading older entries…</span>
            <span v-else-if="hasMoreLogs">Scroll to load more</span>
            <span v-else>Reached the end of the host log.</span>
        </div>
        <div ref="loadMoreSentinel" class="load-more-sentinel" aria-hidden="true"></div>
    </div>
</template>

<style scoped>
.log-wrapper {
    position: relative;
}

.copy-log-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 5;
    appearance: none;
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    cursor: pointer;
    color: var(--ink-2);
    transition:
        background 80ms ease,
        border-color 80ms ease,
        color 80ms ease,
        transform 80ms ease;
    padding: 0;
}
.copy-log-btn:hover {
    background: var(--bg-soft);
    border-color: var(--line-strong);
    color: var(--ink);
}
.copy-log-btn.copied {
    color: var(--green);
    border-color: var(--green);
    transform: scale(0.95);
}

.empty-log {
    color: var(--ink-4);
}
.log-empty {
    font-size: 12.5px;
}

@media (max-width: 480px) {
    /* Log rows wrap onto multiple lines at this width and reach the top of
       .log-block, so the absolutely-positioned button ends up covering the
       first row's text — dock it above the block instead. */
    .copy-log-btn {
        position: static;
        margin: 0 0 8px auto;
    }
}

.log-footer {
    margin-top: 12px;
    color: var(--ink-3);
    font-size: 12px;
    min-height: 18px;
}

.log-error {
    margin-bottom: 12px;
    color: var(--red);
    font-size: 12px;
}

.load-more-sentinel {
    width: 100%;
    height: 1px;
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
