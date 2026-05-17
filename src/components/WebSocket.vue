<script setup lang="ts">
import { useWebSocket } from '@vueuse/core';
import { watch } from 'vue';
import { useServersStore } from '../stores/servers';
import { useLogsStore } from '../stores/logs';
import { ArsStatusUpdate, CreateImageProgress, IsRunningUpdate, ServerStatusUpdate } from '../utils/interfaces';
import { ArsStatus } from '../api/model';

const serversStore = useServersStore();
const logsStore = useLogsStore();

async function updateArsStatus() {
    const result = await serversStore.getArsStatus();
    serversStore.arsStatus = result;
}

updateArsStatus();

const api = import.meta.env.VITE_API_URL;
const wsProtocol = import.meta.env.VITE_API_WEBSOCKET_PROTOCOL;

const ws = useWebSocket(`${wsProtocol}://${api}/ws`, {
    heartbeat: {
        message: 'ping',
        interval: 1000,
        pongTimeout: 1000
    }
});

watch(ws.data, value => {
    if (value !== 'pong') {
        const update: ServerStatusUpdate = JSON.parse(value);
        if (update.type !== 'createImageProgress') {
            logsStore.add(value);
        }
        console.log(update.type);
        if (update.type === 'isRunningUpdate') {
            const isRunningUpdate: IsRunningUpdate = update as IsRunningUpdate;
            serversStore.isRunningUpdate(isRunningUpdate.uuid, isRunningUpdate.isRunning);
        } else if (update.type === 'arsStatusUpdate') {
            const arsStatusUpdate: ArsStatusUpdate = update as ArsStatusUpdate;
            serversStore.arsStatus = arsStatusUpdate.arsStatus;
        } else if (update.type === 'createImageProgress') {
            logsStore.addProgress(update as CreateImageProgress);
        }
    }
});
</script>

<template>
    <span style="float: right">ARS Status: {{ ArsStatus[serversStore.arsStatus] }}</span>
</template>

<style scoped></style>
