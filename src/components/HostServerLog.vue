<script setup lang="ts">
import { computed, ref } from 'vue';
import { useLogsStore } from '../stores/logs';
import { useServersStore } from '../stores/servers';
import { ArsStatus } from '../utils/interfaces';

const logsStore = useLogsStore();
const serversStore = useServersStore();

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

interface TextPart { kind: 'text'; text: string }
interface ChipPart { kind: 'chip'; uuid: string; serverName: string }
type Part = TextPart | ChipPart

interface ParsedEntry {
    timestamp: string;
    parts: Part[];
}

function resolveServerName(uuid: string): string {
    return serversStore.servers.find(s => s.uuid === uuid)?.name ?? uuid.slice(0, 8);
}

function textToParts(text: string): Part[] {
    const parts: Part[] = [];
    let last = 0;
    for (const m of text.matchAll(UUID_RE)) {
        if (m.index! > last) parts.push({ kind: 'text', text: text.slice(last, m.index) });
        parts.push({ kind: 'chip', uuid: m[0], serverName: resolveServerName(m[0]) });
        last = m.index! + m[0].length;
    }
    if (last < text.length) parts.push({ kind: 'text', text: text.slice(last) });
    return parts.length ? parts : [{ kind: 'text', text }];
}

function parseEntry(raw: string): ParsedEntry {
    const sepIdx = raw.indexOf(']: ');
    const timestamp = sepIdx !== -1 ? raw.slice(1, sepIdx) : '';
    const payload   = sepIdx !== -1 ? raw.slice(sepIdx + 3) : raw;

    try {
        const msg = JSON.parse(payload);

        if (msg.type === 'isRunningUpdate') {
            return {
                timestamp: formatTimestamp(timestamp),
                parts: [
                    { kind: 'chip', uuid: msg.uuid, serverName: resolveServerName(msg.uuid) },
                    { kind: 'text', text: msg.isRunning ? ' started' : ' stopped' },
                ],
            };
        }

        if (msg.type === 'arsStatusUpdate') {
            return {
                timestamp: formatTimestamp(timestamp),
                parts: [{ kind: 'text', text: `ARS status: ${ArsStatus[msg.arsStatus] ?? msg.arsStatus}` }],
            };
        }

        if (msg.type === 'message') {
            return { timestamp: formatTimestamp(timestamp), parts: textToParts(msg.message) };
        }
    } catch {}

    return { timestamp: formatTimestamp(timestamp), parts: textToParts(payload) };
}

function formatTimestamp(iso: string): string {
    const t = iso.split('T')[1];
    if (!t) return iso;
    return t.replace('Z', '');
}

const parsedLogs = computed(() => logsStore.logs.map(parseEntry));

const copyStates = ref<Record<string, boolean>>({});
const copyTimers: Record<string, ReturnType<typeof setTimeout>> = {};

async function copyUuid(key: string, uuid: string) {
    try { await navigator.clipboard.writeText(uuid); } catch {}
    copyStates.value[key] = true;
    clearTimeout(copyTimers[key]);
    copyTimers[key] = setTimeout(() => { copyStates.value[key] = false; }, 1400);
}
</script>

<template>
  <div class="log-block" v-if="parsedLogs.length > 0">
    <div class="log-row" v-for="(entry, i) in parsedLogs" :key="i">
      <span class="log-time">{{ entry.timestamp }}</span>
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
            <svg v-if="!copyStates[`${i}-${j}`]" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>
          </button>
          <template v-else>{{ part.text }}</template>
        </template>
      </span>
    </div>
  </div>
  <div class="log-block empty-log" v-else>
    <span class="log-empty">No log entries yet.</span>
  </div>
</template>

<style scoped>
.empty-log { color: var(--ink-4); }
.log-empty { font-size: 12.5px; }
</style>
