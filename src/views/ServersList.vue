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
        <HostServerLog />
    </div>
</template>

<style scoped>
#servers-list {
    list-style-type: none;
    padding: 0px;
}
</style>
