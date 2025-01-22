<script setup lang="ts">
import { useLogsStore } from '../stores/logs';
import EmptyState from '../components/EmptyState.vue';

const logsStore = useLogsStore();
</script>

<template>
    <div>
        <h1>Host Server Log</h1>
        <ul id="logs" v-if="logsStore.logs.length > 0">
            <li v-for="logEntry in logsStore.logs">{{ logEntry }}</li>
        </ul>
        <EmptyState v-else />
    </div>
</template>

<style scoped>
#logs {
    list-style-type: none;
    padding: 0px;
}
</style>
