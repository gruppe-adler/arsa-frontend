<script setup lang="ts">
defineProps<{ message?: string }>();
</script>

<template>
  <div class="empty-box">{{ message ?? 'Nothing here yet.' }}</div>
</template>

<style scoped>
.empty-box {
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 40px 24px;
  text-align: center;
  color: var(--ink-3);
  font-size: 14px;
  background: var(--bg);
}
</style>
