<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useServersStore } from '../stores/servers';
import { Server } from '../utils/interfaces';
import { defaultServer } from '../utils/defaults';
import Loading from '../components/Loading.vue';
import NotFound from '../components/NotFound.vue';
import ConfigForm from '../components/ConfigForm.vue';

const route = useRoute();

const loading = ref(true);
const found = ref(false);

const inputViolationCounter = ref(0);

const serversStore = useServersStore();

const server = ref<Server>(defaultServer);

serversStore.getAll().then(() => {
    const result = serversStore.servers.find(i => i.uuid === route.params.id);
    if (result) {
        server.value = result;
        found.value = true;
    }
    loading.value = false;
});
</script>

<template>
    <Loading v-if="loading" />
    <NotFound v-else-if="!found" />
    <div class="view-server-container" v-else>
        <div class="page-header">
            <h1>👁️ View Arma Reforger Server</h1>
            <p class="subtitle">Read-only server configuration view</p>
        </div>
        <div class="form-container">
            <ConfigForm readonly v-model:input-violation-counter="inputViolationCounter" v-model:server="server" />
        </div>
    </div>
</template>

<style scoped>
.view-server-container {
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
</style>
