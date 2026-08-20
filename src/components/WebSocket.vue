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
    LogUpdate,
    PlayerCountUpdate,
    ServerStatusUpdate
} from '../utils/interfaces';
import { useAuthStore } from '../stores/auth';

const serversStore = useServersStore();
const logsStore = useLogsStore();
const authStore = useAuthStore();

async function updateArsStatus() {
    if (!authStore.isAuthenticated) {
        return;
    }

    const result = await serversStore.getArsStatus();
    serversStore.arsStatus = result;
}

const api = import.meta.env.VITE_API_URL || 'localhost:3000';
const wsProtocol = import.meta.env.VITE_API_WEBSOCKET_PROTOCOL || 'ws';

let ws: ReturnType<typeof useWebSocket> | undefined;
let retryCount = 0;
const MAX_RETRIES = 5;

async function connectWebSocket() {
    if (!authStore.isAuthenticated) {
        return;
    }

    if (ws) {
        return;
    }

    ws = useWebSocket(`${wsProtocol}://${api}/ws`, {
        heartbeat: {
            message: 'ping',
            interval: 1000,
            pongTimeout: 1000
        },
        autoReconnect: true,
        onDisconnected(_, event) {
            // don't reconnect on auth failure — that's a different problem
            if (event.code === 401 || event.code === 4001 /* your auth close code */) {
                return;
            }

            if (retryCount >= MAX_RETRIES) {
                return;
            }

            retryCount++;
            setTimeout(connectWebSocket, Math.min(1000 * 2 ** retryCount, 30000));
        },
        onConnected() {
            retryCount = 0; // reset on successful connection
        }
    });

    watch(ws.data, value => {
        if (value !== 'pong' && typeof value === 'string') {
            const update: ServerStatusUpdate = JSON.parse(value);
            if (update.type !== 'createImageProgress') {
                // logsStore.addServerStatusUpdate(update);
            }
            if (update.type === 'logUpdate') {
                const logUpdate = update as LogUpdate;
                logsStore.updateLog(logUpdate.log);
            } else if (update.type === 'isRunningUpdate') {
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
}

watch(
    () => authStore.isAuthenticated,
    async isAuthenticated => {
        if (!isAuthenticated) {
            return;
        }

        await updateArsStatus();
        await connectWebSocket();
    },
    { immediate: true }
);
</script>

<template><div></div></template>
