<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useLogsStore } from '../stores/logs';
import { Branch, PullLog } from '../api/model';
import { ProgressRoot, ProgressIndicator } from 'reka-ui';
import prettyBytes from 'pretty-bytes';
import { UUID_REG_EXP, UUID_REG_EXP_FLAGS } from '../utils/shared';

const logsStore = useLogsStore();

const pullLogs = ref<Map<string, Map<string, PullLog>>>();

async function fetchData() {
    await logsStore.loadPullLogs();
    pullLogs.value = logsStore.pullLogs;
}

onMounted(fetchData);

function formatId(pullLog: PullLog): string {
    const isGuid = new RegExp(UUID_REG_EXP, UUID_REG_EXP_FLAGS).test(pullLog.id);
    if (isGuid) {
        return '';
    }
    return pullLog.id + ': ';
}

function formatStatus(pullLog: PullLog): string {
    let ret = '';

    if (pullLog.status && pullLog.status.length > 0) {
        ret = pullLog.status;
    }
    if (pullLog.errorDetailMessage && pullLog.errorDetailMessage.length > 0) {
        ret += ' Error: ' + pullLog.errorDetailMessage;
    }

    return ret;
}

function formatProgress(pullLog: PullLog): string {
    if (pullLog.progressDetailCurrent && pullLog.progressDetailTotal) {
        return `${prettyBytes(pullLog.progressDetailCurrent)} / ${prettyBytes(pullLog.progressDetailTotal)} (${((pullLog.progressDetailCurrent / pullLog.progressDetailTotal) * 100).toFixed(2)}%)`;
    } else if (pullLog.progressDetailCurrent && pullLog.progressDetailCurrent > 0 && !pullLog.progressDetailTotal) {
        return `${pullLog.progressDetailCurrent} s`;
    } else if (pullLog.progressDetailCurrent === 0 && pullLog.progressDetailTotal === 0) {
        return '';
    }
    return `${pullLog.progressDetailCurrent} ${pullLog.progressDetailCurrent}`;
}

function hasProgressValue(pullLog: PullLog): boolean {
    if (
        pullLog.progressDetailCurrent &&
        pullLog.progressDetailCurrent > 0 &&
        pullLog.progressDetailTotal &&
        pullLog.progressDetailTotal > 0
    ) {
        return true;
    }
    return false;
}

function getProgressValue(pullLog: PullLog): number {
    if (pullLog.progressDetailCurrent && pullLog.progressDetailTotal) {
        return (pullLog.progressDetailCurrent / pullLog.progressDetailTotal) * 100;
    }
    return 0;
}

function getBranchFromLogMap(pullLogMaps: Map<string, PullLog>): string {
    return [...pullLogMaps.keys()].find(key => Object.values(Branch).includes(key as Branch)) ?? '';
}
</script>

<template>
    <div class="log-wrapper">
        <div v-if="pullLogs && pullLogs.size > 0">
            <div v-for="[pull_id, pullLogMap] in pullLogs" :key="pull_id">
                <h2 class="section-title">Pull Log: {{ getBranchFromLogMap(pullLogMap) }}</h2>
                <div class="log-block">
                    <div class="log-row">
                        <span class="log-msg" style="width: 100%">
                            <template v-for="[id, pullLog] in pullLogMap" :key="id">
                                <span class="log-time">{{ formatId(pullLog) }}</span>
                                <span class="log-msg" style="display: inline-block; width: 90%"
                                    >{{ formatStatus(pullLog) }} {{ formatProgress(pullLog) }}

                                    <ProgressRoot v-if="hasProgressValue(pullLog)" class="ProgressRoot" style="transform: translateZ(0)">
                                        <ProgressIndicator
                                            class="ProgressIndicator"
                                            :style="`transform: translateX(-${100 - getProgressValue(pullLog)}%)`"
                                        />{{ getProgressValue(pullLog) }}
                                    </ProgressRoot>
                                </span>
                                <br />
                            </template>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.ProgressRoot {
    width: 25rem;
    height: 8px;
    background-color: #e5e7eb;
    border-radius: 9999px;
    overflow: hidden;
    display: inherit;
}

.ProgressIndicator {
    height: 100%;
    /* width: 100%; */
    background-color: #6366f1;
    transition: transform 0.3s ease;
}

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
