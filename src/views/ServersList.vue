<script setup lang="ts">
import { computed } from 'vue';

import { useServersStore } from '../stores/servers';
import ServerItem from '../components/ServerItem.vue';
import { Server } from '../utils/interfaces';
import EmptyState from '../components/EmptyState.vue';
import HostServerLog from '../components/HostServerLog.vue';

const serversStore = useServersStore();

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
</script>

<template>
    <div class="servers-list-container">
        <div class="page-header">
            <h1>🖥️ Arma Reforger Servers</h1>
            <p class="subtitle">Manage and monitor your Arma Reforger game servers</p>
        </div>
        <ul id="servers-list" v-if="sortedServers.length > 0">
            <ServerItem
                @server-deleted="onServerDeleted"
                @server-cloned="onServerCloned"
                v-for="(_item, idx) in sortedServers"
                v-model="sortedServers[idx]"
            ></ServerItem>
        </ul>
        <EmptyState v-else />
        <HostServerLog />
    </div>
</template>

<style scoped>
.servers-list-container {
    max-width: 1200px;
    margin: 0 auto;
}

.page-header {
    text-align: center;
    margin-bottom: 2.5rem;
    padding: 2rem;
    background: linear-gradient(135deg, rgba(26, 31, 46, 0.6) 0%, rgba(37, 45, 61, 0.6) 100%);
    border-radius: 12px;
    border: 1px solid var(--border-color);
}

.page-header h1 {
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, var(--primary-accent) 0%, var(--text-primary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.subtitle {
    color: var(--text-secondary);
    font-size: 1.1rem;
    margin: 0;
}

#servers-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
}
</style>
