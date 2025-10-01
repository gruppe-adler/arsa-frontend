<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useServersStore } from '../stores/servers';
import { Server } from '../utils/interfaces';
import { defaultServer } from '../utils/defaults';
import ConfigForm from '../components/ConfigForm.vue';
import ConfigUploadDownload from '../components/ConfigUploadDownload.vue';

const router = useRouter();

const serversStore = useServersStore();

// I need to clone the defaultServer const object. Otherwise it's changed by the form.
// I don't know why this ref thing does that. Perhaps objects are always just references.
const server = ref<Server>(Object.assign({}, defaultServer));

const inputViolationCounter = ref(0);

const disabled = computed<boolean>(() => (inputViolationCounter.value > 0 ? true : false));

function addServer() {
    serversStore.add(server.value).then(() => {
        router.push('/servers-list');
    });
}
</script>

<template>
    <div class="add-server-container">
        <div class="page-header">
            <h1>➕ Add Arma Reforger Server</h1>
            <p class="subtitle">Configure and add a new server instance</p>
        </div>
        <div class="form-container">
            <ConfigUploadDownload v-model:server="server" />
            <ConfigForm v-model:input-violation-counter="inputViolationCounter" v-model:server="server" />
            <div class="form-actions">
                <button class="btn-primary" type="button" :disabled @click="addServer()">➕ Add Server</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.add-server-container {
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

.form-container {
    background: var(--secondary-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: var(--shadow-lg);
}

.form-actions {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: center;
}

.btn-primary {
    padding: 0.85rem 2.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    background: linear-gradient(135deg, var(--primary-accent) 0%, var(--secondary-accent) 100%);
    border: 2px solid var(--primary-accent);
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 0 20px rgba(74, 158, 255, 0.3);
}

.btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--secondary-accent) 0%, var(--primary-accent) 100%);
    box-shadow: 0 0 30px rgba(74, 158, 255, 0.5);
    transform: translateY(-2px);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(0.5);
    transform: none;
}
</style>
