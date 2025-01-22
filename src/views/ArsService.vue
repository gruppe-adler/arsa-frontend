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

updateArsStatus();
</script>

<template>
    <h1>Arma Reforger Server Administration</h1>
    <div class="ars-service-items">
        <button class="form-input-button" type="button" @click="updateArsStatus()">Update ARS Status</button>
        <span class="result">{{ arsStatus }}</span>
    </div>
    <div>
        <button
            class="form-input-button"
            type="button"
            @click="recreateArsDockerImage()"
            :disabled="serversStore.arsStatus === ArsStatus.RECREATING || serversStore.arsStatus === ArsStatus.UNKNOWN"
        >
            Recreate ARS Docker Image
        </button>
    </div>
    <HostServerLog />
</template>

<style scoped>
.ars-service-items {
    margin-bottom: 10px;
}
.result {
    margin-left: 10px;
}
</style>
