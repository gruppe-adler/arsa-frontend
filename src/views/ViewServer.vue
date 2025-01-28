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
    <div class="form-container" v-else>
        <h1>View Arma Reforger Server</h1>
        <ConfigForm readonly v-model:input-violation-counter="inputViolationCounter" v-model:server="server" />
    </div>
</template>

<style scoped></style>
