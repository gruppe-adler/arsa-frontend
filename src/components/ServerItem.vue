<script setup lang="ts">

const props = defineProps({
  server: Object
})
</script>

<template>
  <li>
    <p>{{ server.name }} ({{ server.uuid }})</p>
  </li>
</template>

<style scoped>
</style>