<script setup lang="ts">
import { computed, ref } from 'vue';
import { TooltipRoot, TooltipTrigger, TooltipPortal, TooltipContent } from 'reka-ui';
import { HostLog, useLogsStore } from '../stores/logs';
import { useServersStore } from '../stores/servers';
import { ArsStatusUpdate, IsRunningUpdate, Message } from '../utils/interfaces';

const logsStore = useLogsStore();
const serversStore = useServersStore();

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

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

function textToParts(text: string): Part[] {
    const parts: Part[] = [];
    let last = 0;
    for (const m of text.matchAll(UUID_RE)) {
        if (m.index > last) parts.push({ kind: 'text', text: text.slice(last, m.index) });
        parts.push({ kind: 'chip', uuid: m[0], serverName: resolveServerName(m[0]) });
        last = m.index + m[0].length;
    }
    if (last < text.length) parts.push({ kind: 'text', text: text.slice(last) });
    return parts.length ? parts : [{ kind: 'text', text }];
}

function parseEntry(hostLog: HostLog): ParsedEntry {
    const timestamp = hostLog.timestamp;
    const timestampLocal = new Date(timestamp).toLocaleString();
    const timestampRelative = getRelativeTime(timestamp);

    let parts: Part[] = [];

    if (hostLog.log.type === 'isRunningUpdate') {
        const isRunningUpdate = hostLog.log as IsRunningUpdate;
        parts = [
            { kind: 'chip', uuid: isRunningUpdate.uuid, serverName: resolveServerName(isRunningUpdate.uuid) },
            { kind: 'text', text: isRunningUpdate.isRunning ? ' started' : ' stopped' }
        ];
    } else if (hostLog.log.type === 'arsStatusUpdate') {
        const arsStatusUpdate = hostLog.log as ArsStatusUpdate;
        parts = [{ kind: 'text', text: `ARS status: ${arsStatusUpdate.arsStatus}` }];
    } else if (hostLog.log.type === 'message') {
        const message = hostLog.log as Message;
        parts = textToParts(message.message);
    } else if (hostLog.log.type === 'playerCountUpdate') {
        parts = [{ kind: 'text', text: `Player count update received` }];
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

const parsedLogs = computed(() => logsStore.logs.map(parseEntry).reverse());

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
        await navigator.clipboard.writeText(logsStore.logs.join('\n'));
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
        <div v-if="parsedLogs.length > 0" class="log-block">
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
