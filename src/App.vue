<script setup lang="ts">
import Menu from './components/Menu.vue'
</script>

<template>
  <div><Menu/></div>
  <div><RouterView/></div>
</template>

<style scoped>
  Menu {
    grid-column: 1;
    grid-row: 1;
  }

  RouterView {
    grid-column: 1;
    grid-row: 2;
  }
</style>
