<script setup lang="ts">
export interface Tab {
    key: string;
    label: string;
    disabled?: boolean;
}

const props = defineProps<{
    tabs: Tab[];
}>();

const activeTab = defineModel<string>({ required: true });
</script>

<template>
  <div class="tabs">
    <button
      v-for="tab in props.tabs"
      :key="tab.key"
      class="tab-btn"
      :class="{ active: activeTab === tab.key }"
      :disabled="tab.disabled"
      type="button"
      @click="activeTab = tab.key"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex; gap: 2px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 36px;
}
.tab-btn {
  appearance: none; background: none; border: none;
  font: inherit; font-size: 13.5px; font-weight: 500;
  color: var(--ink-3);
  padding: 10px 14px;
  margin-bottom: -1px;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}
.tab-btn:hover:not(:disabled) { color: var(--ink); }
.tab-btn.active { color: var(--ink); border-bottom-color: var(--ink); }
.tab-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
