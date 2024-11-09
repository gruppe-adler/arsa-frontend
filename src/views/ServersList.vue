<script setup lang="ts">
import { computed, watch } from 'vue';

import { useServersStore } from '../stores/servers';
import { useLogsStore } from '../stores/logs';
import ServerItem from '../components/ServerItem.vue';
import { Server, ServerStatusUpdate } from '../utils/interfaces';

const serversStore = useServersStore();
const logsStore = useLogsStore();

serversStore.getPublicIp().then(() => {});
updateServerList();

function updateServerList() {
    serversStore.getAll().then(() => {});
}

function onServerDeleted() {
    updateServerList();
}

function onServerCloned() {
    updateServerList();
}

const sortedServers = computed(() => {
    const clonedServers = Object.assign([], serversStore.servers); // clone array
    return clonedServers.sort((a: Server, b: Server) => (a.name < b.name ? -1 : 1));
});

import { useWebSocket } from '@vueuse/core';
import EmptyState from '../components/EmptyState.vue';
const api = import.meta.env.VITE_API_URL;

const ws = useWebSocket(`ws://${api}:3000/ws`, {
    heartbeat: {
        message: 'ping',
        interval: 1000,
        pongTimeout: 1000
    }
});

watch(ws.data, value => {
    if (value !== 'pong') {
        logsStore.add(value);
        const update: ServerStatusUpdate = JSON.parse(value);
        serversStore.isRunningUpdate(update.uuid, update.isRunning);
    }
});
</script>

<template>
    <div>
        <h1>Arma Reforger Servers List</h1>
        <ul id="servers-list" v-if="sortedServers.length > 0">
            <ServerItem
                @server-deleted="onServerDeleted"
                @server-cloned="onServerCloned"
                v-for="(_item, idx) in sortedServers"
                v-model="sortedServers[idx]"
            ></ServerItem>
        </ul>
        <EmptyState v-else />
        <h1>Host Server Log</h1>
        <ul id="logs" v-if="logsStore.logs.length > 0">
            <li v-for="logEntry in logsStore.logs">{{ logEntry }}</li>
        </ul>
        <EmptyState v-else />
    </div>
</template>

<style scoped>
#servers-list {
    list-style-type: none;
    padding: 0px;
}
#logs {
    list-style-type: none;
    padding: 0px;
}
</style>
