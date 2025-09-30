<script setup lang="ts">
import { computed, ref } from 'vue';
import { useServersStore } from '../stores/servers';
import { ArsStatus } from '../utils/interfaces';
import HostServerLog from '../components/HostServerLog.vue';
import FormSelectInput from '../components/FormSelectInput.vue';

const serversStore = useServersStore();
const selectedSteamAppId = ref<string>('1874900');

async function updateArsStatus() {
    const result = await serversStore.getArsStatus();
    serversStore.arsStatus = result;
}

async function recreateArsDockerImage() {
    const steamAppId = parseInt(selectedSteamAppId.value);
    await serversStore.recreateArsDockerImageWithSteamAppId(steamAppId);
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
        <FormSelectInput
            :name="'Steam App Version for Docker Image'"
            :tooltip="'Select between stable (1874900) and experimental (1890870) Arma Reforger Server versions'"
            :options="['1874900', '1890870']"
            :selectedIndex="selectedSteamAppId === '1874900' ? 0 : 1"
            :readonly="false"
            v-model="selectedSteamAppId"
        />
        <br />
        <button
            class="form-input-button"
            type="button"
            @click="recreateArsDockerImage()"
            :disabled="serversStore.arsStatus === ArsStatus.RECREATING || serversStore.arsStatus === ArsStatus.UNKNOWN"
        >
            Recreate ARS Docker Image
        </button>
        <span class="warning">Don't use this button unless you know what you're doing.</span>
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
.warning {
    margin-left: 10px;
    color: red;
}
</style>
