<script setup lang="ts">
import { useWebSocket } from '@vueuse/core';
import { watch } from 'vue';
import { useServersStore } from '../stores/servers';
import { useLogsStore } from '../stores/logs';
import {
    ArsStatusUpdate,
    CreateImageFinished,
    CreateImageProgress,
    IsRunningUpdate,
    PlayerCountUpdate,
    ServerStatusUpdate
} from '../utils/interfaces';

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
        // console.log(value);
        const update: ServerStatusUpdate = JSON.parse(value);
        if (update.type !== 'createImageProgress') {
            logsStore.addServerStatusUpdate(update);
        }
        if (update.type === 'isRunningUpdate') {
            const isRunningUpdate: IsRunningUpdate = update as IsRunningUpdate;
            serversStore.isRunningUpdate(isRunningUpdate.uuid, isRunningUpdate.isRunning);
        } else if (update.type === 'arsStatusUpdate') {
            const arsStatusUpdate: ArsStatusUpdate = update as ArsStatusUpdate;
            serversStore.arsStatus = arsStatusUpdate.arsStatus;
        } else if (update.type === 'playerCountUpdate') {
            const playerCountUpdate: PlayerCountUpdate = update as PlayerCountUpdate;
            serversStore.playerCountUpdate(playerCountUpdate.uuid, playerCountUpdate.playerCount);
        } else if (update.type === 'createImageProgress') {
            const createImageProgress: CreateImageProgress = update as CreateImageProgress;
            logsStore.updatePullLog(createImageProgress.info);
        } else if (update.type === 'createImageFinished') {
            const createImageFinished: CreateImageFinished = update as CreateImageFinished;
            logsStore.clearPullLog(createImageFinished.pullId);
        }
    }
});
</script>

<template></template>
