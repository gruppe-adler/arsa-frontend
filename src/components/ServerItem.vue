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
    const server: Server = model.value!;
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
    <li class="server-item">
        <div class="server-content">
            <div class="server-header">
                <div class="server-status-section">
                    <span class="status-badge" :class="model!.isRunning ? 'status-online' : 'status-offline'">
                        <span class="status-dot" :class="model!.isRunning ? 'dot-online' : 'dot-offline'"></span>
                        {{ model!.isRunning ? 'Online' : 'Offline' }}
                    </span>
                    <button
                        class="btn-control btn-stop"
                        type="button"
                        @click="serversStore.stop(model!.uuid)"
                        :disabled="serversStore.arsStatus !== ArsStatus.AVAILABLE"
                        v-if="model!.isRunning"
                    >
                        ⏹ Stop
                    </button>
                    <button
                        class="btn-control btn-start"
                        type="button"
                        @click="serversStore.start(model!.uuid)"
                        :disabled="serversStore.arsStatus !== ArsStatus.AVAILABLE"
                        v-else
                    >
                        ▶️ Start
                    </button>
                </div>
                
                <div class="server-info">
                    <span class="server-port">Port: {{ model!.config.bindPort }}</span>
                    <RouterLink class="server-name" :to="`/edit-server/${model!.uuid}`" v-if="!model!.isRunning">
                        {{ model!.name }}
                    </RouterLink>
                    <RouterLink class="server-name" :to="`/view-server/${model!.uuid}`" v-else>
                        {{ model!.name }}
                    </RouterLink>
                    <span class="server-uuid">{{ model!.uuid }}</span>
                </div>
            </div>
            
            <div class="server-actions">
                <button class="btn-action btn-danger" type="button" @click="onClickDelete" :disabled="model!.isRunning" title="Delete Server">
                    🗑️ Delete
                </button>
                <button class="btn-action" type="button" @click="onClickClone" title="Clone Server">
                    📋 Clone
                </button>
                <button class="btn-action" type="button" @click="onClickLogs" title="View Logs">
                    📄 Logs
                </button>
                <button class="btn-action" type="button" @click="onClickSize" title="Check Size">
                    💾 Size
                </button>
                <button class="btn-action" type="button" @click="onClickStats" :disabled="!model!.isRunning" title="View Stats">
                    📊 Stats
                </button>
                <button class="btn-action" type="button" @click="onClickKnownPlayers" title="Known Players">
                    👥 Players
                </button>
            </div>
        </div>
    </li>
</template>

<style scoped>
.server-item {
    background: linear-gradient(135deg, rgba(26, 31, 46, 0.9) 0%, rgba(37, 45, 61, 0.9) 100%);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    margin-bottom: 1rem;
    padding: 1.5rem;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-md);
}

.server-item:hover {
    border-color: var(--primary-accent);
    box-shadow: var(--shadow-lg);
    transform: translateX(4px);
}

.server-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.server-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.server-status-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-online {
    background: rgba(72, 187, 120, 0.2);
    color: var(--success-color);
    border: 2px solid var(--success-color);
}

.status-offline {
    background: rgba(113, 128, 150, 0.2);
    color: var(--text-muted);
    border: 2px solid var(--text-muted);
}

.status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

.dot-online {
    background: var(--success-color);
    box-shadow: 0 0 8px var(--success-color);
}

.dot-offline {
    background: var(--text-muted);
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.6;
    }
}

.btn-control {
    padding: 0.6rem 1.25rem;
    border-radius: 8px;
    font-weight: 600;
    border: 2px solid;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-stop {
    background: linear-gradient(135deg, rgba(245, 101, 101, 0.2) 0%, rgba(245, 101, 101, 0.3) 100%);
    border-color: var(--danger-color);
    color: var(--danger-color);
}

.btn-stop:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(245, 101, 101, 0.4) 0%, rgba(245, 101, 101, 0.5) 100%);
    box-shadow: 0 0 12px rgba(245, 101, 101, 0.4);
}

.btn-start {
    background: linear-gradient(135deg, rgba(72, 187, 120, 0.2) 0%, rgba(72, 187, 120, 0.3) 100%);
    border-color: var(--success-color);
    color: var(--success-color);
}

.btn-start:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(72, 187, 120, 0.4) 0%, rgba(72, 187, 120, 0.5) 100%);
    box-shadow: 0 0 12px rgba(72, 187, 120, 0.4);
}

.server-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
    flex-wrap: wrap;
}

.server-port {
    padding: 0.4rem 0.8rem;
    background: var(--tertiary-bg);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-family: 'Consolas', monospace;
    font-size: 0.9rem;
    color: var(--primary-accent);
}

.server-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    text-decoration: none;
    transition: all 0.3s ease;
}

.server-name:hover {
    color: var(--primary-accent);
    text-shadow: 0 0 8px rgba(74, 158, 255, 0.5);
}

.server-uuid {
    font-family: 'Consolas', monospace;
    font-size: 0.85rem;
    color: var(--text-muted);
    padding: 0.3rem 0.6rem;
    background: rgba(45, 55, 72, 0.5);
    border-radius: 4px;
}

.server-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: flex-end;
}

.btn-action {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    border-radius: 6px;
    background: var(--tertiary-bg);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
}

.btn-action:hover:not(:disabled) {
    background: var(--accent-bg);
    border-color: var(--primary-accent);
    color: var(--text-primary);
}

.btn-danger {
    border-color: rgba(245, 101, 101, 0.5);
}

.btn-danger:hover:not(:disabled) {
    background: rgba(245, 101, 101, 0.2);
    border-color: var(--danger-color);
    color: var(--danger-color);
}

@media (max-width: 768px) {
    .server-header {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .server-actions {
        justify-content: flex-start;
    }
}
</style>
