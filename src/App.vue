<script setup lang="ts">
import Menu from './components/Menu.vue'
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <Menu/>
    </header>
    <main class="app-content">
      <RouterView/>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: rgba(26, 31, 46, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(45, 55, 72, 0.6);
  position: sticky;
  top: 20px;
  z-index: 100;
}

.app-content {
  flex: 1;
  padding: 0 0.5rem;
}
</style>

