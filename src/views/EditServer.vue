<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useServersStore } from '../stores/servers';
import { Server } from '../utils/interfaces';
import { defaultServer } from '../utils/defaults';
import Loading from '../components/Loading.vue';
import NotFound from '../components/NotFound.vue';
import ConfigForm from '../components/ConfigForm.vue';
import ConfigUploadDownload from '../components/ConfigUploadDownload.vue';

const router = useRouter();
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

const disabled = computed<boolean>(() => (inputViolationCounter.value > 0 ? true : false));

function updateServer() {
    serversStore.update(server.value).then(() => {
        router.push('/servers-list');
    });
}
</script>

<template>
    <Loading v-if="loading" />
    <NotFound v-else-if="!found" />
    <div class="form-container" v-else>
        <h1>Edit Server</h1>
        <ConfigUploadDownload v-model:server="server" />
        <ConfigForm v-model:input-violation-counter="inputViolationCounter" v-model:server="server" />
        <br />
        <br />
        <button class="form-input-button" type="button" :disabled @click="updateServer()">Update</button>
    </div>
</template>

<style scoped></style>
