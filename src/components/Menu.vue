<script setup lang="ts"></script>

<template>
  <nav class="nav">
    <RouterLink class="nav-link" to="/servers-list">Servers</RouterLink>
    <RouterLink class="nav-link" to="/add-server">Add server</RouterLink>
    <RouterLink class="nav-link" to="/ars-service">ARS Service</RouterLink>
  </nav>
</template>

<style scoped>
.nav {
  display: flex;
  gap: 4px;
  flex: 1;
}
.nav-link {
  color: var(--ink-2);
  text-decoration: none;
  padding: 8px 12px;
  border-radius: var(--radius);
  font-weight: 500;
  font-size: 14px;
}
.nav-link:hover { color: var(--ink); background: var(--bg-soft); }
.nav-link.router-link-active { color: var(--ink); background: var(--bg-sunken); }
</style>
