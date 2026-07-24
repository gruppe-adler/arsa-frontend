<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useServersStore } from '../stores/servers';
import { useLogsStore } from '../stores/logs';
import { useServerOrganization } from '../composables/useServerOrganization';
import ServerItem from '../components/ServerItem.vue';
import HostServerLog from '../components/HostServerLog.vue';
import { Server } from '../api/model';

const serversStore = useServersStore();
const logsStore = useLogsStore();
const route = useRoute();
const router = useRouter();
const { getCluster, renameCluster, orderServers, moveServerToCluster, orderClusters, moveCluster } = useServerOrganization();

function parsePositiveInteger(value: unknown): number | undefined {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

const hostLogPage = computed(() => parsePositiveInteger(route.query.page) ?? 1);
const hostLogLimit = computed(() => parsePositiveInteger(route.query.limit));

async function updateServerList() {
    await serversStore.getAll();
}

function onServerDeleted() {
    updateServerList();
}
function onServerCloned() {
    updateServerList();
}

// Groups by cluster (dragged onto in each server's tile), ordered within each
// group by drag position. Ungrouped servers always sort last. Group headlines
// only render once there's more than one group, so a fresh install with
// nothing clustered still looks like a plain list. `key` is the raw cluster
// name ('' for ungrouped); `name` is what's actually shown.
const serverGroups = computed(() => {
    const groups = new Map<string, Server[]>();
    for (const server of serversStore.servers as Server[]) {
        const cluster = server.uuid ? getCluster(server.uuid) : '';
        const list = groups.get(cluster) ?? [];
        list.push(server);
        groups.set(cluster, list);
    }
    const namedClusters = orderClusters([...groups.keys()].filter(key => key !== '').sort((a, b) => a.localeCompare(b)));
    const orderedKeys = groups.has('') ? [...namedClusters, ''] : namedClusters;
    return orderedKeys.map(key => ({ key, name: key || 'Ungrouped', servers: orderServers(groups.get(key)!) }));
});
const showGroupHeadlines = computed(() => serverGroups.value.length > 1);

const dragOverKey = ref<string | null>(null);

function onGroupDrop(cluster: string, event: DragEvent) {
    dragOverKey.value = null;
    const draggedUuid = event.dataTransfer?.getData('text/plain');
    if (draggedUuid) {
        moveServerToCluster(draggedUuid, cluster);
    }
}

function onRenameCluster(cluster: string) {
    const next = prompt(`Rename cluster "${cluster}" to (leave empty to ungroup):`, cluster);
    if (next === null) {
        return;
    }
    renameCluster(cluster, next);
}

function onNewClusterDrop(event: DragEvent) {
    dragOverKey.value = null;
    const draggedUuid = event.dataTransfer?.getData('text/plain');
    if (!draggedUuid) {
        return;
    }
    const name = prompt('Name this new cluster:');
    if (!name || !name.trim()) {
        return;
    }
    moveServerToCluster(draggedUuid, name);
}

// Cluster sections themselves are reordered by dragging their headline handle
// onto another headline — a separate drag payload type from a server uuid so
// the two kinds of drop zones never mix up what's being dragged.
function onClusterDragStart(cluster: string, event: DragEvent) {
    event.dataTransfer?.setData('application/x-cluster', cluster);
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
    }
}
function onClusterDragEnter(cluster: string) {
    if (cluster) {
        dragOverKey.value = `cluster:${cluster}`;
    }
}
function onClusterDrop(targetCluster: string, event: DragEvent) {
    dragOverKey.value = null;
    if (!targetCluster) {
        return;
    }
    const draggedCluster = event.dataTransfer?.getData('application/x-cluster');
    if (draggedCluster) {
        moveCluster(draggedCluster, targetCluster);
    }
}

onMounted(async () => {
    await serversStore.getPublicIp();
    await updateServerList();
});
</script>

<template>
    <main>
        <div class="page-header">
            <div>
                <h1>Servers</h1>
                <p>
                    Manage Arma Reforger server instances. Start, stop, clone, or inspect logs and statistics. Drag a server's
                    handle onto another to reorder or cluster it.
                </p>
            </div>
            <div class="page-actions">
                <button class="btn btn-ghost" @click="updateServerList">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6" />
                    </svg>
                    Refresh
                </button>
                <button class="btn btn-primary" @click="router.push('/add-server')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    New server
                </button>
            </div>
        </div>

        <template v-if="serversStore.servers.length > 0">
            <div v-for="group in serverGroups" :key="group.key" class="server-group">
                <h2
                    v-if="showGroupHeadlines"
                    class="group-headline"
                    :class="{ 'drag-over': dragOverKey === `cluster:${group.key}` }"
                    @dragover.prevent
                    @dragenter.prevent="onClusterDragEnter(group.key)"
                    @dragleave="dragOverKey = null"
                    @drop.prevent="onClusterDrop(group.key, $event)"
                >
                    <button
                        v-if="group.key"
                        class="cluster-drag-handle"
                        type="button"
                        draggable="true"
                        title="Drag to reorder clusters"
                        @dragstart="onClusterDragStart(group.key, $event)"
                        @click.stop
                    >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="9" cy="6" r="1.6" />
                            <circle cx="15" cy="6" r="1.6" />
                            <circle cx="9" cy="12" r="1.6" />
                            <circle cx="15" cy="12" r="1.6" />
                            <circle cx="9" cy="18" r="1.6" />
                            <circle cx="15" cy="18" r="1.6" />
                        </svg>
                    </button>
                    <span title="Click to rename" @click="onRenameCluster(group.name)">{{ group.name }}</span>
                </h2>
                <div
                    class="servers"
                    :class="{ 'drag-over': dragOverKey === group.key }"
                    @dragover.prevent
                    @dragenter.prevent="dragOverKey = group.key"
                    @dragleave="dragOverKey = null"
                    @drop.prevent="onGroupDrop(group.key, $event)"
                >
                    <ServerItem
                        v-for="server in group.servers"
                        :key="server.uuid"
                        :modelValue="server"
                        @serverDeleted="onServerDeleted"
                        @serverCloned="onServerCloned"
                    />
                </div>
            </div>

            <div
                class="new-cluster-zone"
                :class="{ 'drag-over': dragOverKey === '__new__' }"
                @dragover.prevent
                @dragenter.prevent="dragOverKey = '__new__'"
                @dragleave="dragOverKey = null"
                @drop.prevent="onNewClusterDrop"
            >
                Drag a server here to start a new cluster
            </div>
        </template>
        <div v-else class="servers empty-servers">
            <p class="empty-label">No servers yet. Add one to get started.</p>
        </div>

        <div class="log-header">
            <h2 class="section-title">Host server log</h2>
            <button class="btn btn-sm" @click="logsStore.clear">
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Clear
            </button>
        </div>
        <HostServerLog :page="hostLogPage" :limit="hostLogLimit" />
    </main>
</template>

<style scoped>
main {
    max-width: 1280px;
    margin: 0 auto;
    padding: 48px var(--gutter) 96px;
}
.page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 32px;
    margin-bottom: 36px;
}
.page-header h1 {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.02em;
    margin: 0 0 6px;
}
.page-header p {
    margin: 0;
    color: var(--ink-3);
    font-size: 14px;
    max-width: 56ch;
}
.page-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.server-group + .server-group {
    margin-top: 28px;
}
.group-headline {
    margin: 0 0 10px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ink-3);
    padding: 2px 6px 2px 2px;
    border-radius: var(--radius);
}
.group-headline.drag-over {
    outline: 1px dashed var(--indigo);
    outline-offset: -1px;
}
.group-headline span {
    cursor: pointer;
}
.group-headline span:hover {
    color: var(--ink);
    text-decoration: underline;
}
.cluster-drag-handle {
    appearance: none;
    border: none;
    background: none;
    padding: 2px;
    color: var(--ink-4);
    cursor: grab;
    display: grid;
    place-items: center;
}
.cluster-drag-handle:hover {
    color: var(--ink-2);
}
.cluster-drag-handle:active {
    cursor: grabbing;
}

.servers {
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    background: var(--bg);
    overflow: hidden;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
}
.servers.drag-over {
    outline: 1px dashed var(--indigo);
    outline-offset: -1px;
}
.empty-servers {
    padding: 40px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.empty-label {
    color: var(--ink-3);
    font-size: 14px;
    margin: 0;
}

.new-cluster-zone {
    margin-top: 12px;
    padding: 14px;
    border: 1px dashed var(--line-strong);
    border-radius: var(--radius-lg);
    text-align: center;
    font-size: 12.5px;
    color: var(--ink-4);
}
.new-cluster-zone.drag-over {
    border-color: var(--indigo);
    color: var(--indigo);
    background: var(--indigo-soft);
}

.log-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 64px 0 16px;
}
.log-header .section-title {
    margin: 0;
    flex: 1;
}

@media (max-width: 480px) {
    .page-header h1 {
        font-size: 22px;
    }
    .page-header {
        gap: 12px;
        flex-wrap: wrap;
    }
    .page-actions {
        flex-shrink: 1;
    }
}
</style>
