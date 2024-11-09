<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useServersStore } from '../stores/servers';
import { PlayerIdentityId } from '../utils/interfaces';
import Loading from '../components/Loading.vue';
import NotFound from '../components/NotFound.vue';
import EmptyState from '../components/EmptyState.vue';

const route = useRoute();

const loading = ref(true);
const found = ref(false);

const serversStore = useServersStore();

const knownPlayers = ref<PlayerIdentityId[]>([]);
serversStore.getKnownPlayers(route.params.id as string).then(players => {
    if (players) {
        knownPlayers.value = players;
        found.value = true;
    }
    loading.value = false;
});

const sortedKnownPlayers = computed((): PlayerIdentityId[] => {
    const clonedKnownPlayers = Object.assign([], knownPlayers.value); // clone array
    return clonedKnownPlayers.sort((a: PlayerIdentityId, b: PlayerIdentityId) => (a.name < b.name ? -1 : 1));
});
</script>

<template>
    <Loading v-if="loading" />
    <NotFound v-else-if="!found" />
    <div v-else>
        <h1>Known Players List</h1>
        <ul id="logs" v-if="sortedKnownPlayers.length > 0">
            <li v-for="knownPlayer in sortedKnownPlayers">{{ knownPlayer.name }} ({{ knownPlayer.identityId }})</li>
        </ul>
        <EmptyState v-else />
    </div>
</template>

<style scoped>
#logs {
    list-style-type: none;
    padding: 0px;
}

.links {
    margin-left: 10px;
}
</style>
