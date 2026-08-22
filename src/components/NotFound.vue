<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<template>
  <main class="page-main">
    <p class="eyebrow">Not found</p>
    <h1>Resource not found</h1>
    <p class="sub">The item you requested could not be found. It may have been deleted or the ID is invalid.</p>
    <button class="btn" @click="router.push('/servers-list')">Back to servers</button>
  </main>
</template>

<style scoped>
.page-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 96px var(--gutter);
}
.eyebrow {
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-3);
  margin: 0 0 12px;
}
h1 {
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0 0 8px;
  color: var(--ink);
}
.sub {
  color: var(--ink-3);
  font-size: 15px;
  margin: 0 0 28px;
}
</style>
