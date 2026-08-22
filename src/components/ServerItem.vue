<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useServersStore } from '../stores/servers';
import { useServerOrganization } from '../composables/useServerOrganization';
import { ArsStatus, Server } from '../api/model';

const model = defineModel<Server>();
const emit = defineEmits(['serverDeleted', 'serverCloned']);
const router = useRouter();
const serversStore = useServersStore();
const { moveServer } = useServerOrganization();

const copyState = ref<'idle' | 'copied'>('idle');
let copyTimer: ReturnType<typeof setTimeout>;

const isDragOver = ref(false);

function onDragStart(event: DragEvent) {
    if (!model?.value?.uuid) {
        return;
    }
    event.dataTransfer?.setData('text/plain', model.value.uuid);
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
    }
}
function onDrop(event: DragEvent) {
    isDragOver.value = false;
    const draggedUuid = event.dataTransfer?.getData('text/plain');
    if (!draggedUuid || !model?.value?.uuid) {
        return;
    }
    moveServer(draggedUuid, model.value.uuid);
}

async function copyUuid() {
    if (!model?.value?.uuid) {
        return;
    }
    const uuid = model.value.uuid;
    try {
        await navigator.clipboard.writeText(uuid);
    } catch {}
    copyState.value = 'copied';
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
        copyState.value = 'idle';
    }, 1400);
}

function onClickDelete() {
    if (!model?.value?.uuid) {
        return;
    }
    if (confirm('Do you really want to delete this server?')) {
        serversStore.delete(model.value.uuid).then(() => emit('serverDeleted'));
    }
}
function onClickClone() {
    if (!model.value) {
        return;
    }
    const server: Server = { ...model.value };
    server.name = server.name.concat(' Duplicate');
    server.uuid = '';
    server.isRunning = false;
    serversStore.add(server).then(() => emit('serverCloned'));
}
function serverRoute(tab?: string) {
    if (!model?.value?.uuid) {
        return '';
    }
    const base = model.value.isRunning ? `/view-server/${model.value.uuid}` : `/edit-server/${model.value.uuid}`;
    return tab ? `${base}?tab=${tab}` : base;
}

function onClickLogs() {
    router.push(serverRoute('logs'));
}
function onClickStats() {
    router.push(serverRoute('stats'));
}
function onClickName() {
    router.push(serverRoute());
}

const shortUuid = (uuid: string) => uuid.slice(0, 8);
const arsAvailable = () => serversStore.arsStatus === ArsStatus.Available;
</script>

<template>
    <div
        class="server-row"
        :class="{ 'drag-over': isDragOver }"
        @click="onClickName"
        @dragover.prevent
        @dragenter.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @drop.prevent="onDrop"
    >
        <button class="drag-handle" type="button" draggable="true" title="Drag to reorder or cluster" @dragstart="onDragStart" @click.stop>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="6" r="1.6" />
                <circle cx="15" cy="6" r="1.6" />
                <circle cx="9" cy="12" r="1.6" />
                <circle cx="15" cy="12" r="1.6" />
                <circle cx="9" cy="18" r="1.6" />
                <circle cx="15" cy="18" r="1.6" />
            </svg>
        </button>

        <!-- status -->
        <div class="server-status" :class="{ online: model!.isRunning }">
            <span class="dot" :class="model!.isRunning ? 'green' : ''"></span>
            <span>{{ model!.isRunning ? 'Online' : 'Offline' }}</span>
        </div>

        <!-- meta -->
        <div class="server-meta">
            <a class="server-name">{{ model!.name }}</a>
            <div class="server-info">
                <span class="port-tag">:{{ model!.config.bindPort }}</span>
                <span class="players-tag" :title="`${model!.playerCount} player${model!.playerCount === 1 ? '' : 's'} online`">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {{ model!.playerCount }}
                </span>
                <span class="branch-tag" :class="model!.branch">{{ model!.branch }}</span>
                <button
                    class="id-chip"
                    :class="{ copied: copyState === 'copied' }"
                    :title="copyState === 'copied' ? 'Copied!' : 'Click to copy UUID'"
                    @click.stop="copyUuid"
                >
                    <span class="id-label">{{ shortUuid(model!.uuid!) }}</span>
                    <svg
                        v-if="copyState === 'idle'"
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
            </div>
        </div>

        <!-- actions -->
        <div class="server-actions" @click.stop>
            <button v-if="model!.isRunning" class="btn btn-stop" :disabled="!arsAvailable()" @click="serversStore.stop(model!.uuid!)">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="1" /></svg>
                Stop
            </button>
            <button v-else class="btn btn-start" :disabled="!arsAvailable()" @click="serversStore.start(model!.uuid!)">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l16 8-16 8z" /></svg>
                Start
            </button>

            <span class="divider-v"></span>

            <div class="btn-group">
                <button class="btn" :disabled="!model!.isRunning" @click="onClickStats">Stats</button>
                <button class="btn" @click="onClickLogs">Logs</button>
            </div>

            <span class="divider-v"></span>

            <div class="btn-group">
                <button class="btn" type="button" @click="onClickClone">Clone</button>
                <button class="btn btn-danger" type="button" @click="onClickDelete">Delete</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.server-row {
    display: grid;
    grid-template-columns: 20px 110px 1fr auto;
    align-items: center;
    gap: 24px;
    padding: 20px 24px;
    border-bottom: 1px solid var(--line);
    cursor: pointer;
}
.server-row:last-child {
    border-bottom: none;
}
.server-row:hover {
    background: var(--bg-soft);
}
.server-row.drag-over {
    background: var(--indigo-soft);
    outline: 1px dashed var(--indigo);
    outline-offset: -1px;
}

.drag-handle {
    appearance: none;
    border: none;
    background: none;
    padding: 4px;
    margin: -4px;
    color: var(--ink-4);
    cursor: grab;
    display: grid;
    place-items: center;
}
.drag-handle:hover {
    color: var(--ink-2);
}
.drag-handle:active {
    cursor: grabbing;
}

.server-status {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--ink-2);
    font-weight: 500;
}
.server-status.online {
    color: var(--ink);
}

.server-meta {
    min-width: 0;
}
.server-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--ink);
    letter-spacing: -0.01em;
    text-decoration: none;
    cursor: pointer;
    display: inline-block;
}
.server-name:hover {
    color: var(--indigo);
}

.server-info {
    margin-top: 4px;
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
    color: var(--ink-3);
}

.players-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11.5px;
    padding: 2px 6px;
    border: 1px solid var(--line-strong);
    border-radius: 4px;
    color: var(--ink-2);
    background: var(--bg-soft);
}

.branch-tag {
    font-size: 10.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 2px 7px;
    border-radius: 4px;
    color: var(--ink-3);
    background: var(--bg-soft);
    border: 1px solid var(--line);
}
.branch-tag.experimental {
    color: var(--amber);
    background: color-mix(in oklab, var(--amber), transparent 88%);
    border-color: color-mix(in oklab, var(--amber), transparent 65%);
}

.server-actions {
    display: flex;
    gap: 4px;
    align-items: center;
}
.server-actions .btn {
    padding: 6px 10px;
    font-size: 12.5px;
}

.divider-v {
    width: 1px;
    height: 18px;
    background: var(--line);
    margin: 0 4px;
}

@media (max-width: 480px) {
    .server-row {
        grid-template-columns: 20px 1fr;
        gap: 10px;
        padding: 16px;
    }
    .server-status,
    .server-meta,
    .server-actions {
        grid-column: 2;
    }
    .server-info {
        flex-wrap: wrap;
    }
    .server-actions {
        flex-wrap: wrap;
    }
    .divider-v {
        display: none;
    }
}
</style>
