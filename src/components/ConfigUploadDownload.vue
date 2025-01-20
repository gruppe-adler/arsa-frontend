<script setup lang="ts">
import { ref } from 'vue';
import { Server } from '../utils/interfaces';

const server = defineModel<Server>('server', { required: true });

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
    uploadConfigDisabled.value = target.value === '' ? true : false;
}

function uploadConfig() {
    if (file.value) {
        file.value.text().then(content => (server.value.config = JSON.parse(content)));
    }
    if (fileSelector.value) fileSelector.value.value = '';
}
</script>

<template>
    <button class="form-input-button" type="button" @click="downloadConfig('server.json', server)">Download Server</button>
    <br />
    <br />
    <button class="form-input-button" type="button" @click="downloadConfig('config.json', server.config)">Download Config</button>
    <button class="form-input-button" type="button" @click="uploadConfig()" :disabled="uploadConfigDisabled">Upload Config</button>
    <input ref="fileSelector" class="form-input-button" type="file" @change="onFileChanged($event)" accept="application/json" />
</template>
