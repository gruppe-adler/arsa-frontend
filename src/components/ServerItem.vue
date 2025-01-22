<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useServersStore } from '../stores/servers';
import { ArsStatus, Server } from '../utils/interfaces';

const model = defineModel<Server>();

const emit = defineEmits(['serverDeleted', 'serverCloned']);

const router = useRouter();

const serversStore = useServersStore();

function onClickDelete() {
    if (confirm('Do you really want to delete this server?')) {
        serversStore.delete(model.value!.uuid).then(() => {
            emit('serverDeleted');
        });
    }
}

function onClickClone() {
    const server: Server = model.value!;
    server.name = server.name.concat(' Duplicate');
    server.uuid = '';
    serversStore.add(server).then(() => {
        emit('serverCloned');
    });
}

function onClickLogs() {
    router.push(`/server-logs-list/${model.value!.uuid}`);
}

function onClickStats() {
    router.push(`/server-stats/${model.value!.uuid}`);
}

function onClickKnownPlayers() {
    router.push(`/players-list/${model.value!.uuid}`);
}
</script>

<template>
    <li>
        <p>
            <span class="column-left" v-if="model!.isRunning">Online</span>
            <span class="column-left" v-else>Offline</span>
            <button
                class="column-left"
                style="background-color: rgba(255, 0, 0, 0.5)"
                type="button"
                @click="serversStore.stop(model!.uuid)"
                :disabled="serversStore.arsStatus !== ArsStatus.AVAILABLE"
                v-if="model!.isRunning"
            >
                Stop
            </button>
            <button
                class="column-left"
                style="background-color: rgba(0, 255, 0, 0.5)"
                type="button"
                @click="serversStore.start(model!.uuid)"
                :disabled="serversStore.arsStatus !== ArsStatus.AVAILABLE"
                v-else
            >
                Start
            </button>
            <span> [{{ model!.config.bindPort }}] </span>
            <RouterLink :to="`/edit-server/${model!.uuid}`" v-if="!model!.isRunning">{{ model!.name }}</RouterLink>
            <RouterLink :to="`/view-server/${model!.uuid}`" v-else>{{ model!.name }}</RouterLink>
            <span> ({{ model!.uuid }})</span>
            <button class="column-right" type="button" @click="onClickDelete" :disabled="model!.isRunning">Delete</button>
            <button class="column-right" type="button" @click="onClickClone">Clone</button>
            <button class="column-right" type="button" @click="onClickLogs">Logs</button>
            <button class="column-right" type="button" @click="onClickStats" :disabled="!model!.isRunning">Stats</button>
            <button class="column-right" type="button" @click="onClickKnownPlayers">Known Players</button>
        </p>
    </li>
</template>

<style scoped>
.column-left {
    margin-right: 10px;
}

.column-right {
    margin-left: 10px;
    float: right;
}
</style>
