<script setup lang="ts">
import { ref, computed, useSlots, provide, VNode } from 'vue';

const slots = useSlots();

const tabTitles = computed<string[]>(() => {
    if (!slots.default) {
        return [];
    }
    // slots.default() returns an array of VNodes.
    // We filter for component VNodes that have a 'title' prop.
    return slots.default()
        .filter((node: VNode) => 
            node && 
            typeof node.type === 'object' && // Ensures it's a component-like VNode
            node.props?.title
        )
        .map((node: VNode) => node.props!.title);
});

const selectedTitle = ref<string>(tabTitles.value[0]);

provide('selectedTitle', selectedTitle);
</script>

<template>
    <div class="tabs-wrapper">
        <div class="tabs-header">
            <button
                v-for="title in tabTitles"
                :key="title"
                class="tab-btn"
                :class="{ active: selectedTitle === title }"
                @click="selectedTitle = title"
            >
                {{ title }}
            </button>
        </div>
        <div class="tabs-content">
            <slot />
        </div>
    </div>
</template>

<style>
.tabs-wrapper {
  width: 100%;
}

.tabs-header {
  display: flex;
  gap: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--spacing-lg);
}

.tab-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  background-color: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 1rem;
  color: var(--text-secondary);
  transition: all 0.2s ease-in-out;
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-btn.active {
  color: var(--color-highlight);
  border-bottom-color: var(--color-highlight);
  font-weight: 600;
}

/* The content of the active tab is shown inside Tab.vue, which has a .tab-content class */
.tab-content {
    padding-top: var(--spacing-md);
}
</style>