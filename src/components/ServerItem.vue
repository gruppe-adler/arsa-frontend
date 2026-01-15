<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useServersStore } from '../stores/servers';
import { ArsStatus, Server } from '../utils/interfaces';

const model = defineModel<Server>();

const emit = defineEmits(['serverDeleted', 'serverCloned']);

const router = useRouter();

const serversStore = useServersStore();

function onClickDelete() {
    if (confirm('Do you really want to delete this server?')) {
        serversStore.delete(model.value!.uuid).then(() => {
            emit('serverDeleted');
        });
    }
}

function onClickClone() {
    const server: Server = JSON.parse(JSON.stringify(model.value!));
    server.name = server.name.concat(' Duplicate');
    server.uuid = '';
    serversStore.add(server).then(() => {
        emit('serverCloned');
    });
}

function onClickLogs() {
    router.push(`/server-logs-list/${model.value!.uuid}`);
}

function onClickSize() {
    router.push(`/server-size/${model.value!.uuid}`);
}

function onClickStats() {
    router.push(`/server-stats/${model.value!.uuid}`);
}

function onClickKnownPlayers() {
    router.push(`/players-list/${model.value!.uuid}`);
}
</script>

<template>
    <li class="card server-item">
        <div class="server-info">
            <div class="server-name">
                <span class="status-indicator" :class="{ 'online': model!.isRunning }"></span>
                <RouterLink :to="`/edit-server/${model!.uuid}`" v-if="!model!.isRunning">{{ model!.name }}</RouterLink>
                <RouterLink :to="`/view-server/${model!.uuid}`" v-else>{{ model!.name }}</RouterLink>
                <span class="server-port">[{{ model!.config.bindPort }}]</span>
            </div>
            <div class="server-status">
                <span v-if="model!.isRunning">Online</span>
                <span v-else>Offline</span>
            </div>
        </div>
        <div class="server-actions">
            <div class="main-actions">
                 <button
                    class="btn-negative"
                    type="button"
                    @click="serversStore.stop(model!.uuid)"
                    :disabled="serversStore.arsStatus !== ArsStatus.AVAILABLE"
                    v-if="model!.isRunning"
                >
                    Stop
                </button>
                <button
                    class="btn-positive"
                    type="button"
                    @click="serversStore.start(model!.uuid)"
                    :disabled="serversStore.arsStatus !== ArsStatus.AVAILABLE"
                    v-else
                >
                    Start
                </button>
            </div>
            <div class="secondary-actions">
                <button type="button" @click="onClickLogs">Logs</button>
                <button type="button" @click="onClickStats" :disabled="!model!.isRunning">Stats</button>
                <button type="button" @click="onClickKnownPlayers">Players</button>
                <button type="button" @click="onClickSize">Size</button>
                <button type="button" @click="onClickClone">Clone</button>
                <button class="btn-negative" type="button" @click="onClickDelete" :disabled="model!.isRunning">Delete</button>
            </div>
        </div>
    </li>
</template>

<style scoped>
.server-item {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
}

.server-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.server-name {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 1.2rem;
    font-weight: 600;
}

.status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--color-negative);
}

.status-indicator.online {
    background-color: var(--color-positive);
}

.server-port {
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.server-status {
    font-weight: 500;
}

.server-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--spacing-md);
}

.main-actions, .secondary-actions {
    display: flex;
    gap: var(--spacing-sm);
}
</style>
