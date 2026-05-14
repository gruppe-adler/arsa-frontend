<script setup lang="ts">
import Menu from './components/Menu.vue'
import WebSocket from './components/WebSocket.vue'
import { useServersStore } from './stores/servers'
import { ArsStatus } from './utils/interfaces'
import { computed } from 'vue'

const serversStore = useServersStore()

const arsStatusDot = computed(() => {
  switch (serversStore.arsStatus) {
    case ArsStatus.AVAILABLE: return 'green'
    case ArsStatus.RECREATING: return 'amber'
    case ArsStatus.RECREATING_FAILURE:
    case ArsStatus.UNAVAILABLE: return 'red'
    default: return ''
  }
})

const arsStatusLabel = computed(() => ArsStatus[serversStore.arsStatus])
</script>

<template>
  <WebSocket />
  <header class="topbar">
    <div class="topbar-inner">
      <RouterLink to="/servers-list" class="brand">
        <div class="brand-mark">A</div>
        <span class="brand-name">ARSA</span>
        <span class="brand-sub">/ Arma Reforger Server Admin</span>
      </RouterLink>
      <Menu />
      <div class="status-chip">
        <span class="dot" :class="arsStatusDot"></span>
        <span>ARS</span>
        <span class="status-chip-value">{{ arsStatusLabel }}</span>
      </div>
    </div>
  </header>
  <RouterView />
</template>

<style scoped>
.topbar {
  border-bottom: 1px solid var(--line);
  background: var(--bg);
  position: sticky;
  top: 0;
  z-index: 10;
}
.topbar-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--gutter);
  height: 60px;
  display: flex;
  align-items: center;
  gap: 40px;
}
.brand {
  display: flex; align-items: center; gap: 10px;
  font-weight: 600;
  letter-spacing: -0.01em;
  white-space: nowrap;
}
.brand-mark {
  width: 22px; height: 22px;
  border-radius: 5px;
  background: var(--ink);
  color: var(--bg);
  display: grid; place-items: center;
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
}
.brand-name { color: var(--ink); }
.brand-sub  { color: var(--ink-3); font-weight: 400; margin-left: 2px; }
.brand { text-decoration: none; }

.status-chip {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 5px 10px 5px 8px;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 12.5px;
  color: var(--ink-2);
  background: var(--bg);
  white-space: nowrap;
}
.status-chip-value { color: var(--ink); font-weight: 500; }
</style>
