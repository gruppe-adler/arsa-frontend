<script setup lang="ts">

import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useServersStore } from '../stores/servers'
import { Server } from '../utils/interfaces'
import ConfigForm from '../components/ConfigForm.vue'
import { defaultServer } from '../utils/defaults'

const router = useRouter()
const route = useRoute()

const serversStore = useServersStore()

const server = ref<Server>(defaultServer)

serversStore.getAll().then(() => {
    const result = serversStore.servers.find(i => i.uuid === route.params.id)
    if (result) server.value = result;
});

const inputViolationCounter = ref(0);

const disabled = computed<boolean>(() => (inputViolationCounter.value > 0) ? true : false);

function updateServer() {
    serversStore.update(server.value)
        .then(() => {
            router.push('/servers-list')
        });
}

function downloadConfig(filename: string, data: any) {
    const configFile = JSON.stringify(data, null, 2);

    let element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(configFile));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();
    document.body.removeChild(element);
}

const file = ref<File | null>();
const fileSelector = ref<HTMLInputElement | null>(null);
const uploadConfigDisabled = ref(true);

function onFileChanged($event: Event) {
    const target = $event.target as HTMLInputElement;
    if (target && target.files) {
        file.value = target.files[0];

    }
    uploadConfigDisabled.value = (target.value === '') ? true : false
}

function uploadConfig() {
    if (file.value) {
        file.value.text().then(content => server.value.config = JSON.parse(content));
    }
    if (fileSelector.value) fileSelector.value.value = '';
}



</script>

<template>
    <div class="form-container">
        <h1>Edit Server</h1>
        <button class="form-input-button" type="button" @click="downloadConfig('server.json', server)">Download
            Server</button>
        <br />
        <br />
        <button class="form-input-button" type="button" @click="downloadConfig('config.json', server.config)">Download
            Config</button>
        <button class="form-input-button" type="button" @click="uploadConfig()" :disabled="uploadConfigDisabled">Upload
            Config</button>
        <input ref="fileSelector" class="form-input-button" type="file" @change="onFileChanged($event)"
            accept="application/json" />
        <ConfigForm v-model:input-violation-counter="inputViolationCounter" v-model:server="server" />
        <br />
        <br />
        <button class="form-input-button" type="button" :disabled @click="updateServer()">Update</button>
    </div>
</template>

<style scoped></style>