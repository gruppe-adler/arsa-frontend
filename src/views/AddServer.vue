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
    <div class="form-container">
        <h1>Add Arma Reforger Server</h1>
        <ConfigUploadDownload v-model:server="server" />
        <ConfigForm v-model:input-violation-counter="inputViolationCounter" v-model:server="server" />
        <br />
        <br />
        <button type="button" :disabled @click="addServer()">Add</button>
    </div>
</template>

<style scoped></style>
