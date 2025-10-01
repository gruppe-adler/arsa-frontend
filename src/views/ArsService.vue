<script setup lang="ts">
import { computed } from 'vue';
import { useServersStore } from '../stores/servers';
import { ArsStatus } from '../utils/interfaces';
import HostServerLog from '../components/HostServerLog.vue';

const serversStore = useServersStore();

async function updateArsStatus() {
    const result = await serversStore.getArsStatus();
    serversStore.arsStatus = result;
}

async function recreateArsDockerImage() {
    await serversStore.recreateArsDockerImage();
}

const arsStatus = computed<string>(() => {
    return ArsStatus[serversStore.arsStatus];
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

updateArsStatus();
</script>

<template>
    <div class="ars-service-container">
        <div class="page-header">
            <h1>⚙️ Arma Reforger Server Administration</h1>
            <p class="subtitle">Manage ARS service and Docker configuration</p>
        </div>
        
        <div class="ars-service-card">
            <div class="ars-service-items">
                <button class="btn-update" type="button" @click="updateArsStatus()">🔄 Update ARS Status</button>
                <div class="status-display">
                    <span class="status-badge-ars" :class="getStatusClass">
                        <span class="status-icon">{{ getStatusIcon }}</span>
                        <span class="status-text">{{ arsStatus }}</span>
                    </span>
                </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="docker-section">
                <button
                    class="btn-docker"
                    type="button"
                    @click="recreateArsDockerImage()"
                    :disabled="serversStore.arsStatus === ArsStatus.RECREATING || serversStore.arsStatus === ArsStatus.UNKNOWN"
                >
                    🐳 Recreate ARS Docker Image
                </button>
                <span class="warning-message">
                    <span class="warning-icon">⚠️</span>
                    Don't use this button unless you know what you're doing.
                </span>
            </div>
        </div>
        
        <HostServerLog />
    </div>
</template>

<style scoped>
.ars-service-container {
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

.ars-service-card {
    background: var(--secondary-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: var(--shadow-lg);
}

.ars-service-items {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
}

.btn-update {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    background: linear-gradient(135deg, var(--tertiary-bg) 0%, var(--accent-bg) 100%);
    border: 2px solid var(--primary-accent);
    border-radius: 8px;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-update:hover {
    background: linear-gradient(135deg, var(--primary-accent) 0%, var(--secondary-accent) 100%);
    box-shadow: 0 0 20px rgba(74, 158, 255, 0.4);
    transform: translateY(-2px);
}

.status-display {
    flex: 1;
    display: flex;
    justify-content: flex-end;
}

.status-badge-ars {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    font-weight: 600;
    font-size: 1.1rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: 2px solid;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-md);
}

.status-icon {
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.status-available {
    background: linear-gradient(135deg, rgba(72, 187, 120, 0.2) 0%, rgba(72, 187, 120, 0.3) 100%);
    color: var(--success-color);
    border-color: var(--success-color);
    box-shadow: 0 0 20px rgba(72, 187, 120, 0.4);
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
    box-shadow: 0 0 20px rgba(237, 137, 54, 0.4);
}

.status-recreating .status-icon {
    animation: spin 2s linear infinite;
}

.status-failure {
    background: linear-gradient(135deg, rgba(245, 101, 101, 0.2) 0%, rgba(245, 101, 101, 0.3) 100%);
    color: var(--danger-color);
    border-color: var(--danger-color);
    box-shadow: 0 0 20px rgba(245, 101, 101, 0.4);
}

.status-failure .status-icon {
    animation: shake 0.5s infinite;
}

.status-unavailable {
    background: linear-gradient(135deg, rgba(245, 101, 101, 0.15) 0%, rgba(245, 101, 101, 0.25) 100%);
    color: var(--danger-color);
    border-color: var(--danger-color);
    opacity: 0.9;
}

.divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border-color), transparent);
    margin: 1.5rem 0;
}

.docker-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.btn-docker {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    background: linear-gradient(135deg, rgba(245, 101, 101, 0.15) 0%, rgba(245, 101, 101, 0.25) 100%);
    border: 2px solid var(--danger-color);
    border-radius: 8px;
    color: var(--danger-color);
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    align-self: flex-start;
}

.btn-docker:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(245, 101, 101, 0.3) 0%, rgba(245, 101, 101, 0.4) 100%);
    box-shadow: 0 0 20px rgba(245, 101, 101, 0.4);
    transform: translateY(-2px);
}

.btn-docker:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(0.5);
}

.warning-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(237, 137, 54, 0.1);
    border: 1px solid var(--warning-color);
    border-radius: 8px;
    color: var(--warning-color);
    font-weight: 500;
}

.warning-icon {
    font-size: 1.2rem;
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

@media (max-width: 768px) {
    .ars-service-items {
        flex-direction: column;
        align-items: stretch;
    }
    
    .status-display {
        justify-content: center;
    }
}
</style>
