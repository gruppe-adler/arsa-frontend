<script setup lang="ts">

import { ref } from 'vue';

import { useRoute } from 'vue-router'

import { useServersStore } from '../stores/servers'

const route = useRoute();

const serversStore = useServersStore();

const serverLog = ref('')
serversStore.getLog(route.params.id as string, 
        route.params.log as string, 
        route.params.file as string).then((log) => serverLog.value = log.replace(/\n/g, '<br>'))

</script>

<template>
  <h1>View Server Log {{ route.params.log }}/{{ route.params.file }}</h1>
  <p v-html="serverLog"></p>
</template>

<style scoped>
</style>