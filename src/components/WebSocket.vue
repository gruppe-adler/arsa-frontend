<script setup lang="ts">
import { useWebSocket } from '@vueuse/core';
import { watch, computed } from 'vue';
import { useServersStore } from '../stores/servers';
import { useLogsStore } from '../stores/logs';
import { ArsStatus, ArsStatusUpdate, IsRunningUpdate, ServerStatusUpdate } from '../utils/interfaces';

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
        logsStore.add(value);
        const update: ServerStatusUpdate = JSON.parse(value);
        if (update.type === 'isRunningUpdate') {
            const isRunningUpdate: IsRunningUpdate = update as IsRunningUpdate;
            serversStore.isRunningUpdate(isRunningUpdate.uuid, isRunningUpdate.isRunning);
        }
        if (update.type === 'arsStatusUpdate') {
            const arsStatusUpdate: ArsStatusUpdate = update as ArsStatusUpdate;
            serversStore.arsStatus = arsStatusUpdate.arsStatus;
        }
    }
});

const getStatusClass = computed(() => {
    const status = serversStore.arsStatus;
    switch (status) {
        case 1: // AVAILABLE
            return 'status-available';
        case 2: // RECREATING
            return 'status-recreating';
        case 3: // RECREATING_FAILURE
            return 'status-failure';
        case 4: // UNAVAILABLE
            return 'status-unavailable';
        default: // UNKNOWN
            return 'status-unknown';
    }
});

const getStatusIcon = computed(() => {
    const status = serversStore.arsStatus;
    switch (status) {
        case 1: // AVAILABLE
            return '✓';
        case 2: // RECREATING
            return '⟳';
        case 3: // RECREATING_FAILURE
            return '⚠';
        case 4: // UNAVAILABLE
            return '✕';
        default: // UNKNOWN
            return '?';
    }
});
</script>

<template>
    <div class="websocket-status">
        <span class="status-label">ARS Status:</span>
        <span class="status-badge-ars" :class="getStatusClass">
            <span class="status-icon">{{ getStatusIcon }}</span>
            <span class="status-text">{{ ArsStatus[serversStore.arsStatus] }}</span>
        </span>
    </div>
</template>

<style scoped>
.websocket-status {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.status-label {
    font-weight: 500;
    color: var(--text-secondary);
    font-size: 0.95rem;
}

.status-badge-ars {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: 2px solid;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-sm);
}

.status-icon {
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.status-available {
    background: linear-gradient(135deg, rgba(72, 187, 120, 0.2) 0%, rgba(72, 187, 120, 0.3) 100%);
    color: var(--success-color);
    border-color: var(--success-color);
    box-shadow: 0 0 15px rgba(72, 187, 120, 0.3);
}

.status-available .status-icon {
    animation: pulse 2s infinite;
}

.status-unknown {
    background: linear-gradient(135deg, rgba(113, 128, 150, 0.2) 0%, rgba(113, 128, 150, 0.3) 100%);
    color: var(--text-muted);
    border-color: var(--text-muted);
}

.status-recreating {
    background: linear-gradient(135deg, rgba(237, 137, 54, 0.2) 0%, rgba(237, 137, 54, 0.3) 100%);
    color: var(--warning-color);
    border-color: var(--warning-color);
    box-shadow: 0 0 15px rgba(237, 137, 54, 0.3);
}

.status-recreating .status-icon {
    animation: spin 2s linear infinite;
}

.status-failure {
    background: linear-gradient(135deg, rgba(245, 101, 101, 0.2) 0%, rgba(245, 101, 101, 0.3) 100%);
    color: var(--danger-color);
    border-color: var(--danger-color);
    box-shadow: 0 0 15px rgba(245, 101, 101, 0.3);
}

.status-failure .status-icon {
    animation: shake 0.5s infinite;
}

.status-unavailable {
    background: linear-gradient(135deg, rgba(245, 101, 101, 0.15) 0%, rgba(245, 101, 101, 0.25) 100%);
    color: var(--danger-color);
    border-color: var(--danger-color);
    opacity: 0.8;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.6;
    }
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@keyframes shake {
    0%, 100% {
        transform: translateX(0);
    }
    25% {
        transform: translateX(-3px);
    }
    75% {
        transform: translateX(3px);
    }
}
</style>

