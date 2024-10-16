<script setup lang="ts">

import { computed, ref } from 'vue';

import { useRoute } from 'vue-router'

import { useServersStore } from '../stores/servers'
import { PlayerIdentityId } from '../utils/interfaces';

const route = useRoute();

const serversStore = useServersStore();

const knownPlayers = ref<PlayerIdentityId[]>([]);
serversStore.getKnownPlayers(route.params.id as string).then((players) => knownPlayers.value = players)

const sortedKnownPlayers = computed((): PlayerIdentityId[] => {
  const clonedKnownPlayers = Object.assign([], knownPlayers.value) // clone array
  return clonedKnownPlayers.sort((a: PlayerIdentityId, b: PlayerIdentityId) => (a.name <  b.name) ? -1 : 1)
})

</script>

<template>
  <h1>Known Players List</h1>
  <ul id="logs">
      <li v-for="knownPlayer in sortedKnownPlayers">
        {{ knownPlayer.name }} ({{ knownPlayer.identityId }})
      </li>
    </ul>
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